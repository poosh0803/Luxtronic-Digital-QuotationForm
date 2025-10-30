require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');

// Configure multer for form data
const upload = multer();

// Middleware to handle both URL-encoded and multipart form data
router.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Get the latest quotation
router.get('/quotation/latest', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotations ORDER BY created_at DESC LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No quotations found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get a quotation by ID
router.get('/quotation/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM quotations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all quotations
router.get('/quotations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

function debugTableData(data) {
  console.log('=== DEBUG TABLE DATA ===');
  console.log('Data type:', typeof data);
  console.log('Data is null/undefined:', data == null);
  
  if (data && typeof data === 'object') {
    console.log('Object keys:', Object.keys(data));
    console.log('Object entries count:', Object.keys(data).length);
    
    // Check if it's a FormData object
    if (data.entries && typeof data.entries === 'function') {
      console.log('Processing as FormData:');
      for (let [key, value] of data.entries()) {
        console.log(`  ${key}: "${value}"`);
      }
    } else {
      // It's a regular object
      console.log('Processing as regular object:');
      for (let [key, value] of Object.entries(data)) {
        console.log(`  ${key}: "${value}"`);
      }
    }
  } else {
    console.log('Data is not an object:', data);
  }
  console.log('=== END DEBUG ===');
}
// Create a new quotation
router.post('/quotation', (req, res, next) => {
  // Check content type and apply appropriate middleware
  if (req.get('Content-Type')?.includes('multipart/form-data')) {
    upload.none()(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  // Debug after middleware has processed the data
  console.log('Content-Type:', req.get('Content-Type'));
  const {
    customer_name,
    price,
    final_price,
    platform,
    created_at,
    cpu_details,
    cpu_unit,
    cpu_upgrade_note,
    cpu_cooling_details,
    cpu_cooling_unit,
    cpu_cooling_upgrade_note,
    motherboard_details,
    motherboard_unit,
    motherboard_upgrade_note,
    ram_details,
    ram_unit,
    ram_upgrade_note,
    storage1_details,
    storage1_unit,
    storage1_upgrade_note,
    storage2_details,
    storage2_unit,
    storage2_upgrade_note,
    gpu_details,
    gpu_unit,
    gpu_upgrade_note,
    case_details,
    case_unit,
    case_upgrade_note,
    psu_details,
    psu_unit,
    psu_upgrade_note,
    sys_fan_details,
    sys_fan_unit,
    sys_fan_upgrade_note,
    os_details,
    os_unit,
    os_upgrade_note,
    monitor_details,
    monitor_unit,
    monitor_upgrade_note,
    others_details,
    others_unit,
    others_upgrade_note
  } = req.body;

  // Helper function to convert empty strings to null for integer fields
  const parseIntOrNull = (value) => {
    return (value === '' || value === null || value === undefined) ? null : parseInt(value, 10);
  };

  try {
    const result = await pool.query(
      `INSERT INTO quotations (
        customer_name, price, final_price, platform, cpu_details, cpu_unit, cpu_upgrade_note,
        cpu_cooling_details, cpu_cooling_unit, cpu_cooling_upgrade_note, motherboard_details,
        motherboard_unit, motherboard_upgrade_note, ram_details, ram_unit, ram_upgrade_note,
        storage1_details, storage1_unit, storage1_upgrade_note, storage2_details, storage2_unit,
        storage2_upgrade_note, gpu_details, gpu_unit, gpu_upgrade_note, case_details, case_unit,
        case_upgrade_note, psu_details, psu_unit, psu_upgrade_note, sys_fan_details, sys_fan_unit,
        sys_fan_upgrade_note, os_details, os_unit, os_upgrade_note, monitor_details, monitor_unit,
        monitor_upgrade_note, others_details, others_unit, others_upgrade_note, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
        $39, $40, $41, $42, $43, $44
      ) RETURNING *`,
      [
        customer_name, price, final_price, platform, cpu_details, parseIntOrNull(cpu_unit), cpu_upgrade_note,
        cpu_cooling_details, parseIntOrNull(cpu_cooling_unit), cpu_cooling_upgrade_note, motherboard_details,
        parseIntOrNull(motherboard_unit), motherboard_upgrade_note, ram_details, parseIntOrNull(ram_unit), ram_upgrade_note,
        storage1_details, parseIntOrNull(storage1_unit), storage1_upgrade_note, storage2_details, parseIntOrNull(storage2_unit),
        storage2_upgrade_note, gpu_details, parseIntOrNull(gpu_unit), gpu_upgrade_note, case_details, parseIntOrNull(case_unit),
        case_upgrade_note, psu_details, parseIntOrNull(psu_unit), psu_upgrade_note, sys_fan_details, parseIntOrNull(sys_fan_unit),
        sys_fan_upgrade_note, os_details, parseIntOrNull(os_unit), os_upgrade_note, monitor_details, parseIntOrNull(monitor_unit),
        monitor_upgrade_note, others_details, parseIntOrNull(others_unit), others_upgrade_note, created_at
      ]
    );
    console.log('Quotation created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error details:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error detail:', err.detail);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update a quotation by ID
router.put('/quotation/:id', (req, res, next) => {
  // Check content type and apply appropriate middleware
  if (req.get('Content-Type')?.includes('multipart/form-data')) {
    upload.none()(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  const { id } = req.params;
  const {
    customer_name,
    price,
    final_price,
    platform,
    created_at,
    cpu_details,
    cpu_unit,
    cpu_price,
    cpu_upgrade_note,
    cpu_cooling_details,
    cpu_cooling_unit,
    cpu_cooling_price,
    cpu_cooling_upgrade_note,
    motherboard_details,
    motherboard_unit,
    motherboard_price,
    motherboard_upgrade_note,
    ram_details,
    ram_unit,
    ram_price,
    ram_upgrade_note,
    storage1_details,
    storage1_unit,
    storage1_price,
    storage1_upgrade_note,
    storage2_details,
    storage2_unit,
    storage2_price,
    storage2_upgrade_note,
    gpu_details,
    gpu_unit,
    gpu_price,
    gpu_upgrade_note,
    case_details,
    case_unit,
    case_price,
    case_upgrade_note,
    psu_details,
    psu_unit,
    psu_price,
    psu_upgrade_note,
    sys_fan_details,
    sys_fan_unit,
    sys_fan_price,
    sys_fan_upgrade_note,
    os_details,
    os_unit,
    os_price,
    os_upgrade_note,
    monitor_details,
    monitor_unit,
    monitor_price,
    monitor_upgrade_note,
    others_details,
    others_unit,
    others_price,
    others_upgrade_note
  } = req.body;

  // Helper function to convert empty strings to null for integer fields
  const parseIntOrNull = (value) => {
    return (value === '' || value === null || value === undefined) ? null : parseInt(value, 10);
  };
  const parseFloatOrNull = (value) => {
    return (value === '' || value === null || value === undefined) ? null : parseFloat(value);
  };

  try {
    const result = await pool.query(
      `UPDATE quotations SET
        customer_name = $1, price = $2, final_price = $3, platform = $4, cpu_details = $5, cpu_unit = $6, cpu_price = $7, cpu_upgrade_note = $8,
        cpu_cooling_details = $9, cpu_cooling_unit = $10, cpu_cooling_price = $11, cpu_cooling_upgrade_note = $12,
        motherboard_details = $13, motherboard_unit = $14, motherboard_price = $15, motherboard_upgrade_note = $16,
        ram_details = $17, ram_unit = $18, ram_price = $19, ram_upgrade_note = $20,
        storage1_details = $21, storage1_unit = $22, storage1_price = $23, storage1_upgrade_note = $24,
        storage2_details = $25, storage2_unit = $26, storage2_price = $27, storage2_upgrade_note = $28,
        gpu_details = $29, gpu_unit = $30, gpu_price = $31, gpu_upgrade_note = $32,
        case_details = $33, case_unit = $34, case_price = $35, case_upgrade_note = $36,
        psu_details = $37, psu_unit = $38, psu_price = $39, psu_upgrade_note = $40,
        sys_fan_details = $41, sys_fan_unit = $42, sys_fan_price = $43, sys_fan_upgrade_note = $44,
        os_details = $45, os_unit = $46, os_price = $47, os_upgrade_note = $48,
        monitor_details = $49, monitor_unit = $50, monitor_price = $51, monitor_upgrade_note = $52,
        others_details = $53, others_unit = $54, others_price = $55, others_upgrade_note = $56,
        created_at = $57
      WHERE id = $58 RETURNING *`,
      [
        customer_name, price, final_price, platform, cpu_details, parseIntOrNull(cpu_unit), parseFloatOrNull(cpu_price), cpu_upgrade_note,
        cpu_cooling_details, parseIntOrNull(cpu_cooling_unit), parseFloatOrNull(cpu_cooling_price), cpu_cooling_upgrade_note,
        motherboard_details, parseIntOrNull(motherboard_unit), parseFloatOrNull(motherboard_price), motherboard_upgrade_note,
        ram_details, parseIntOrNull(ram_unit), parseFloatOrNull(ram_price), ram_upgrade_note,
        storage1_details, parseIntOrNull(storage1_unit), parseFloatOrNull(storage1_price), storage1_upgrade_note,
        storage2_details, parseIntOrNull(storage2_unit), parseFloatOrNull(storage2_price), storage2_upgrade_note,
        gpu_details, parseIntOrNull(gpu_unit), parseFloatOrNull(gpu_price), gpu_upgrade_note,
        case_details, parseIntOrNull(case_unit), parseFloatOrNull(case_price), case_upgrade_note,
        psu_details, parseIntOrNull(psu_unit), parseFloatOrNull(psu_price), psu_upgrade_note,
        sys_fan_details, parseIntOrNull(sys_fan_unit), parseFloatOrNull(sys_fan_price), sys_fan_upgrade_note,
        os_details, parseIntOrNull(os_unit), parseFloatOrNull(os_price), os_upgrade_note,
        monitor_details, parseIntOrNull(monitor_unit), parseFloatOrNull(monitor_price), monitor_upgrade_note,
        others_details, parseIntOrNull(others_unit), parseFloatOrNull(others_price), others_upgrade_note,
        created_at, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// New endpoint to fetch all records with limited fields
router.get('/records', async (req, res) => {
  console.log('=== API /api/records called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  
  try {
    console.log('Attempting to connect to database...');
    console.log('Database config:', {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('Executing query: SELECT id, platform, customer_name, created_at, price, final_price FROM quotations ORDER BY created_at DESC');
    const result = await pool.query('SELECT id, platform, customer_name, created_at, price, final_price FROM quotations ORDER BY created_at DESC');
    
    console.log('Query executed successfully');
    console.log('Records found:', result.rows.length);
    console.log('Sample record (first):', result.rows[0]);
    console.log('All records:', result.rows);
    
    res.json(result.rows);
  } catch (err) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    console.error('Full error object:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete a quotation by ID
router.delete('/quotation/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('=== DELETE QUOTATION REQUEST ===');
  console.log('Quotation ID to delete:', id);
  
  try {
    // First check if the quotation exists
    const checkResult = await pool.query('SELECT id FROM quotations WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log('Quotation not found for ID:', id);
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Delete the quotation
    const deleteResult = await pool.query('DELETE FROM quotations WHERE id = $1 RETURNING id', [id]);
    
    console.log('Quotation deleted successfully:', deleteResult.rows[0]);
    res.json({ 
      message: 'Quotation deleted successfully', 
      deletedId: deleteResult.rows[0].id 
    });
    
  } catch (err) {
    console.error('=== DELETE ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// ===== FAVORITES API ENDPOINTS =====

// Get all favorite quotation IDs
router.get('/favorites', async (req, res) => {
  try {
    console.log('=== GET FAVORITES ===');
    const result = await pool.query('SELECT quotation_id FROM favorites ORDER BY created_at DESC');
    const favoriteIds = result.rows.map(row => row.quotation_id);
    console.log('Retrieved favorite IDs:', favoriteIds);
    res.json(favoriteIds);
  } catch (err) {
    console.error('Error getting favorites:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add a quotation to favorites
router.post('/favorites/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  try {
    console.log('=== ADD TO FAVORITES ===');
    console.log('Adding quotation ID to favorites:', quotationId);
    
    // Check if quotation exists
    const quotationCheck = await pool.query('SELECT id FROM quotations WHERE id = $1', [quotationId]);
    if (quotationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Add to favorites (will fail silently if already exists due to UNIQUE constraint)
    const result = await pool.query(
      'INSERT INTO favorites (quotation_id) VALUES ($1) ON CONFLICT (quotation_id) DO NOTHING RETURNING *',
      [quotationId]
    );
    
    if (result.rows.length > 0) {
      console.log('Added to favorites:', result.rows[0]);
      res.status(201).json({ message: 'Added to favorites', favorite: result.rows[0] });
    } else {
      console.log('Already in favorites:', quotationId);
      res.json({ message: 'Already in favorites' });
    }
    
  } catch (err) {
    console.error('Error adding to favorites:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Remove a quotation from favorites
router.delete('/favorites/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  try {
    console.log('=== REMOVE FROM FAVORITES ===');
    console.log('Removing quotation ID from favorites:', quotationId);
    
    const result = await pool.query(
      'DELETE FROM favorites WHERE quotation_id = $1 RETURNING *',
      [quotationId]
    );
    
    if (result.rows.length > 0) {
      console.log('Removed from favorites:', result.rows[0]);
      res.json({ message: 'Removed from favorites', removed: result.rows[0] });
    } else {
      console.log('Not found in favorites:', quotationId);
      res.status(404).json({ error: 'Not found in favorites' });
    }
    
  } catch (err) {
    console.error('Error removing from favorites:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Check if a quotation is favorited
router.get('/favorites/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  try {
    const result = await pool.query('SELECT id FROM favorites WHERE quotation_id = $1', [quotationId]);
    const isFavorited = result.rows.length > 0;
    res.json({ isFavorited });
  } catch (err) {
    console.error('Error checking favorite status:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;