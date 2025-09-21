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
    // Test Airtable connection
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Rheumatology News API is running!',
      airtable: {
        connected: airtableResponse.ok,
        baseId: process.env.AIRTABLE_BASE_ID,
        tableId: process.env.AIRTABLE_TABLE_ID
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
}
