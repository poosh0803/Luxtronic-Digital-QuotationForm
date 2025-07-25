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
