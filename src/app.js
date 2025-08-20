require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const middleware = require('./route/middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // Keep JSON parser for other endpoints
app.use(express.static(path.join(__dirname, 'public')));

// Use middleware for quotation routes
app.use('/api', middleware);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/newQuotation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'newQuotation.html'));
});

app.get('/records', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'records.html'));
});

app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

// Proxy endpoint to fetch StaticICE data (to bypass CORS)
app.get('/api/staticice-proxy', async (req, res) => {
  const { q: query, spos = '3' } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://www.staticice.com.au/cgi-bin/search.cgi?q=${encodeURIComponent(query)}&spos=${spos}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    res.json({ 
      success: true, 
      content: html, 
      url: url,
      query: query
    });
    
  } catch (error) {
    console.error('StaticICE proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from StaticICE',
      message: error.message 
    });
  }
});

app.post('/submit-quotation', (req, res) => {
  const { customerName, components } = req.body;
  // Logic to calculate quotation based on components
  const quotation = calculateQuotation(components);
  res.json({ customerName, quotation });
});

function calculateQuotation(components) {
  // Example logic for calculating quotation
  let total = 0;
  components.forEach(component => {
    total += parseFloat(component.price);
  });
  return total;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
