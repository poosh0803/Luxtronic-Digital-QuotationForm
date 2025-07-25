require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
    const result = await pool.query('SELECT * FROM quotations');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create a new quotation
router.post('/quotation', async (req, res) => {
  const {
    customer_name,
    final_price,
    platform,
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
    others_upgrade_note,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO quotations (
        customer_name, final_price, platform, cpu_details, cpu_unit, cpu_upgrade_note,
        cpu_cooling_details, cpu_cooling_unit, cpu_cooling_upgrade_note, motherboard_details,
        motherboard_unit, motherboard_upgrade_note, ram_details, ram_unit, ram_upgrade_note,
        storage1_details, storage1_unit, storage1_upgrade_note, storage2_details, storage2_unit,
        storage2_upgrade_note, gpu_details, gpu_unit, gpu_upgrade_note, case_details, case_unit,
        case_upgrade_note, psu_details, psu_unit, psu_upgrade_note, sys_fan_details, sys_fan_unit,
        sys_fan_upgrade_note, os_details, os_unit, os_upgrade_note, monitor_details, monitor_unit,
        monitor_upgrade_note, others_details, others_unit, others_upgrade_note
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
        $39, $40, $41, $42
      ) RETURNING *`,
      [
        customer_name, final_price, platform, cpu_details, cpu_unit, cpu_upgrade_note,
        cpu_cooling_details, cpu_cooling_unit, cpu_cooling_upgrade_note, motherboard_details,
        motherboard_unit, motherboard_upgrade_note, ram_details, ram_unit, ram_upgrade_note,
        storage1_details, storage1_unit, storage1_upgrade_note, storage2_details, storage2_unit,
        storage2_upgrade_note, gpu_details, gpu_unit, gpu_upgrade_note, case_details, case_unit,
        case_upgrade_note, psu_details, psu_unit, psu_upgrade_note, sys_fan_details, sys_fan_unit,
        sys_fan_upgrade_note, os_details, os_unit, os_upgrade_note, monitor_details, monitor_unit,
        monitor_upgrade_note, others_details, others_unit, others_upgrade_note
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update a quotation by ID
router.put('/quotation/:id', async (req, res) => {
  const { id } = req.params;
  const {
    customer_name,
    final_price,
    platform,
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
    others_upgrade_note,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE quotations SET
        customer_name = $1, final_price = $2, platform = $3, cpu_details = $4, cpu_unit = $5,
        cpu_upgrade_note = $6, cpu_cooling_details = $7, cpu_cooling_unit = $8,
        cpu_cooling_upgrade_note = $9, motherboard_details = $10, motherboard_unit = $11,
        motherboard_upgrade_note = $12, ram_details = $13, ram_unit = $14, ram_upgrade_note = $15,
        storage1_details = $16, storage1_unit = $17, storage1_upgrade_note = $18,
        storage2_details = $19, storage2_unit = $20, storage2_upgrade_note = $21,
        gpu_details = $22, gpu_unit = $23, gpu_upgrade_note = $24, case_details = $25,
        case_unit = $26, case_upgrade_note = $27, psu_details = $28, psu_unit = $29,
        psu_upgrade_note = $30, sys_fan_details = $31, sys_fan_unit = $32,
        sys_fan_upgrade_note = $33, os_details = $34, os_unit = $35, os_upgrade_note = $36,
        monitor_details = $37, monitor_unit = $38, monitor_upgrade_note = $39,
        others_details = $40, others_unit = $41, others_upgrade_note = $42
      WHERE id = $43 RETURNING *`,
      [
        customer_name, final_price, platform, cpu_details, cpu_unit, cpu_upgrade_note,
        cpu_cooling_details, cpu_cooling_unit, cpu_cooling_upgrade_note, motherboard_details,
        motherboard_unit, motherboard_upgrade_note, ram_details, ram_unit, ram_upgrade_note,
        storage1_details, storage1_unit, storage1_upgrade_note, storage2_details, storage2_unit,
        storage2_upgrade_note, gpu_details, gpu_unit, gpu_upgrade_note, case_details, case_unit,
        case_upgrade_note, psu_details, psu_unit, psu_upgrade_note, sys_fan_details, sys_fan_unit,
        sys_fan_upgrade_note, os_details, os_unit, os_upgrade_note, monitor_details, monitor_unit,
        monitor_upgrade_note, others_details, others_unit, others_upgrade_note, id
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

module.exports = router;