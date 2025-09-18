const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Airtable configuration
const AIRTABLE_CONFIG = {
  baseId: process.env.AIRTABLE_BASE_ID,
  tableId: process.env.AIRTABLE_TABLE_ID,
  accessToken: process.env.AIRTABLE_ACCESS_TOKEN
};

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
        tableId: AIRTABLE_CONFIG.tableId
      }
    });
  } catch (error) {
    res.json({ 
      status: 'WARNING', 
      timestamp: new Date().toISOString(),
      message: 'API running but Airtable connection failed',
      airtable: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Get all articles
app.get('/api/news', async (req, res) => {
  try {
    const response = await airtableAPI.get(`/${AIRTABLE_CONFIG.tableId}`, {
      params: { 
        maxRecords: 50,
        sort: [{ field: 'Published Date', direction: 'desc' }]
      }
    });
    
    const articles = response.data.records.map(transformRecord);
    
    res.json({
      success: true,
      data: articles,
      total: articles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch articles'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rheumatology News API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📰 Articles: http://localhost:${PORT}/api/news`);
  console.log(`✅ Ready with Airtable integration!`);
});