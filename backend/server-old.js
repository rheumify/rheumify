// backend/server.js - Complete Backend with Your Airtable Integration
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Your Airtable Configuration
const AIRTABLE_CONFIG = {
  baseId: process.env.AIRTABLE_BASE_ID || 'app8VygCjp4ck3ujl',
  tableId: process.env.AIRTABLE_TABLE_ID || 'tblCxa3dI0gPGelHN',
  accessToken: process.env.AIRTABLE_ACCESS_TOKEN
};

// Airtable API helper
const axios = require('axios');
const airtableAPI = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_CONFIG.accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Transform Airtable record to our app format
function transformRecord(record) {
  return {
    id: record.id,
    title: record.fields.Title || '',
    source: record.fields.Source || '',
    category: record.fields.Category || '',
    priority: record.fields.Priority || '',
    summary: record.fields.Summary || '',
    url: record.fields['Full URL'] || '',
    publishedDate: record.fields['Published Date'] || '',
    relevanceScore: record.fields['Relevance Score'] || 0,
    keywords: record.fields.Keywords || '',
    saved: record.fields['User Saved'] || false,
    createdDate: record.createdTime
  };
}

// Build Airtable filter formula
function buildFilterFormula(filters) {
  const conditions = [];
  
  if (filters.category) {
    conditions.push(`{Category} = '${filters.category}'`);
  }
  if (filters.source) {
    conditions.push(`{Source} = '${filters.source}'`);
  }
  if (filters.priority) {
    conditions.push(`{Priority} = '${filters.priority}'`);
  }
  if (filters.search) {
    const searchTerm = filters.search.replace(/'/g, "\\'");
    conditions.push(`OR(
      FIND(LOWER('${searchTerm}'), LOWER({Title})),
      FIND(LOWER('${searchTerm}'), LOWER({Summary})),
      FIND(LOWER('${searchTerm}'), LOWER({Keywords}))
    )`);
  }
  
  return conditions.length > 0 ? 
    (conditions.length === 1 ? conditions[0] : `AND(${conditions.join(', ')})`) : 
    '';
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Airtable connection
    const testResponse = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}`, {
      params: { maxRecords: 1 }
    });
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Rheumatology News API is running!',
      airtable: {
        connected: true,
        baseId: AIRTABLE_CONFIG.baseId,
        tableId: AIRTABLE_CONFIG.tableId,
        recordCount: testResponse.data.records.length
      }
    });
  } catch (error) {
    res.json({ 
      status: 'WARNING', 
      timestamp: new Date().toISOString(),
      message: 'API running but Airtable connection failed',
      airtable: {
        connected: false,
        error: error.response?.data?.error?.message || error.message
      }
    });
  }
});

// Get all articles with filtering and search
app.get('/api/news', async (req, res) => {
  try {
    const { category, source, priority, search, limit = 50 } = req.query;
    
    const params = {
      maxRecords: parseInt(limit),
      sort: [{ field: 'Published Date', direction: 'desc' }]
    };

    // Add filters
    const filterFormula = buildFilterFormula({ category, source, priority, search });
    if (filterFormula) {
      params.filterByFormula = filterFormula;
    }

    const response = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}`, { params });
    
    const articles = response.data.records.map(transformRecord);
    
    res.json({
      success: true,
      data: articles,
      total: articles.length,
      timestamp: new Date().toISOString(),
      filters: { category, source, priority, search },
      pagination: {
        limit: parseInt(limit),
        hasMore: articles.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || 'Failed to fetch articles',
      timestamp: new Date().toISOString()
    });
  }
});

// Get single article
app.get('/api/news/:id', async (req, res) => {
  try {
    const response = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}/${req.params.id}`);
    
    res.json({ 
      success: true, 
      data: transformRecord(response.data),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching article:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to fetch article'
      });
    }
  }
});

// Save/bookmark article
app.post('/api/news/:id/save', async (req, res) => {
  try {
    // First get current article to toggle saved status
    const currentResponse = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}/${req.params.id}`);
    const currentSaved = currentResponse.data.fields['User Saved'] || false;
    const newSavedStatus = !currentSaved;
    
    // Update the record
    const updateResponse = await airtableAPI.patch(`/${AIRTABLE_CONFIG.tableId}`, {
      records: [{
        id: req.params.id,
        fields: { 'User Saved': newSavedStatus }
      }]
    });
    
    res.json({ 
      success: true, 
      message: newSavedStatus ? 'Article saved' : 'Article unsaved',
      saved: newSavedStatus,
      data: transformRecord(updateResponse.data.records[0]),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving article:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to save article'
      });
    }
  }
});

// Create new article (for content aggregation)
app.post('/api/news', async (req, res) => {
  try {
    const articleData = req.body;
    
    // Validate required fields
    if (!articleData.title || !articleData.source) {
      return res.status(400).json({
        success: false,
        error: 'Title and source are required'
      });
    }

    const record = {
      fields: {
        'Title': articleData.title,
        'Source': articleData.source,
        'Category': articleData.category || 'General',
        'Priority': articleData.priority || 'Low',
        'Summary': articleData.summary || '',
        'Full URL': articleData.url || '',
        'Published Date': articleData.publishedDate || new Date().toISOString().split('T')[0],
        'Relevance Score': articleData.relevanceScore || 50,
        'Keywords': articleData.keywords || '',
        'User Saved': articleData.saved || false
      }
    };

    const response = await airtableAPI.post(`/${AIRTABLE_CONFIG.tableId}`, { 
      records: [record] 
    });
    
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: transformRecord(response.data.records[0]),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating article:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || 'Failed to create article'
    });
  }
});

// Get saved articles only
app.get('/api/news/saved', async (req, res) => {
  try {
    const params = {
      filterByFormula: '{User Saved} = TRUE()',
      sort: [{ field: 'Published Date', direction: 'desc' }]
    };

    const response = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}`, { params });
    
    const savedArticles = response.data.records.map(transformRecord);
    
    res.json({
      success: true,
      data: savedArticles,
      total: savedArticles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching saved articles:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || 'Failed to fetch saved articles'
    });
  }
});

// Get categories, sources, and priorities for filters (metadata)
app.get('/api/metadata', async (req, res) => {
  try {
    const response = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}`, {
      params: { maxRecords: 1000 }
    });

    const records = response.data.records;
    const categories = [...new Set(records.map(r => r.fields.Category).filter(Boolean))];
    const sources = [...new Set(records.map(r => r.fields.Source).filter(Boolean))];
    const priorities = [...new Set(records.map(r => r.fields.Priority).filter(Boolean))];

    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        sources: sources.sort(),
        priorities: priorities.sort(),
        totalArticles: records.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching metadata:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || 'Failed to fetch metadata'
    });
  }
});

// Basic preferences endpoints (will be enhanced later)
app.get('/api/preferences', (req, res) => {
  res.json({
    success: true,
    preferences: {
      priorityCategories: ['Drug Approval', 'Biologics', 'Research'],
      sources: ['News Article', 'PubMed', 'FDA'],
      keywords: ['rheumatoid arthritis', 'biologics', 'FDA approval'],
      viewMode: 'bullets',
      notifications: {
        highPriority: true,
        dailyDigest: false,
        weeklyRoundup: true
      },
      display: {
        articlesPerPage: 20,
        showRelevanceScores: true,
        compactMode: false
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.put('/api/preferences', (req, res) => {
  // For now, just return success - we'll implement real storage later
  res.json({ 
    success: true, 
    message: 'Preferences updated successfully',
    preferences: req.body,
    timestamp: new Date().toISOString()
  });
});

// Bulk operations for future content aggregation
app.post('/api/news/bulk', async (req, res) => {
  try {
    const articles = req.body.articles;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({
        success: false,
        error: 'Articles array is required'
      });
    }

    const records = articles.map(article => ({
      fields: {
        'Title': article.title,
        'Source': article.source,
        'Category': article.category || 'General',
        'Priority': article.priority || 'Low',
        'Summary': article.summary || '',
        'Full URL': article.url || '',
        'Published Date': article.publishedDate || new Date().toISOString().split('T')[0],
        'Relevance Score': article.relevanceScore || 50,
        'Keywords': article.keywords || '',
        'User Saved': false
      }
    }));

    // Airtable allows max 10 records per batch
    const batches = [];
    for (let i = 0; i < records.length; i += 10) {
      batches.push(records.slice(i, i + 10));
    }

    let createdCount = 0;
    const results = [];

    for (const batch of batches) {
      const response = await airtableAPI.post(`/${AIRTABLE_CONFIG.tableId}`, { 
        records: batch 
      });
      results.push(...response.data.records);
      createdCount += response.data.records.length;
    }

    res.json({
      success: true,
      message: `Successfully created ${createdCount} articles`,
      created: createdCount,
      data: results.map(transformRecord),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error bulk creating articles:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || 'Failed to bulk create articles'
    });
  }
});

// Analytics endpoint (basic stats)
app.get('/api/analytics', async (req, res) => {
  try {
    const response = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}`);
    const records = response.data.records;
    
    const stats = {
      totalArticles: records.length,
      savedArticles: records.filter(r => r.fields['User Saved']).length,
      bySource: {},
      byCategory: {},
      byPriority: {},
      averageRelevanceScore: 0
    };

    let totalRelevance = 0;
    
    records.forEach(record => {
      const fields = record.fields;
      
      // Count by source
      const source = fields.Source || 'Unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      
      // Count by category
      const category = fields.Category || 'Unknown';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Count by priority
      const priority = fields.Priority || 'Unknown';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      
      // Sum relevance scores
      totalRelevance += fields['Relevance Score'] || 0;
    });
    
    stats.averageRelevanceScore = records.length > 0 ? 
      Math.round(totalRelevance / records.length) : 0;

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || 'Failed to fetch analytics'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/news',
      'GET /api/news/:id',
      'POST /api/news/:id/save',
      'POST /api/news',
      'GET /api/news/saved',
      'GET /api/metadata',
      'GET /api/preferences',
      'PUT /api/preferences',
      'POST /api/news/bulk',
      'GET /api/analytics'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rheumatology News API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📰 Articles: http://localhost:${PORT}/api/news`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/news?search=FDA`);
  console.log(`📂 Filter: http://localhost:${PORT}/api/news?category=Drug%20Approval`);
  console.log(`💾 Saved: http://localhost:${PORT}/api/news/saved`);
  console.log(`🔧 Metadata: http://localhost:${PORT}/api/metadata`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`✅ Ready with full Airtable integration!`);
});

module.exports = app;