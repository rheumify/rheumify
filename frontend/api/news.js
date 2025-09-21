export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}?maxRecords=50&sort[0][field]=Published Date&sort[0][direction]=desc`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await airtableResponse.json();
    
    const articles = data.records.map(record => ({
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
    }));

    res.json({
      success: true,
      data: articles,
      total: articles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles'
    });
  }
}
