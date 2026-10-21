const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all tricycles
router.get('/', async (req, res) => {
  try {
    const [tricycles] = await db.query('SELECT * FROM tricycles WHERE status = ? ORDER BY created_at DESC', ['available']);
    res.json(tricycles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tricycle by ID
router.get('/:id', async (req, res) => {
  try {
    const [tricycles] = await db.query('SELECT * FROM tricycles WHERE id = ?', [req.params.id]);
    if (tricycles.length === 0) {
      return res.status(404).json({ message: 'Tricycle not found' });
    }
    res.json(tricycles[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new tricycle (admin only)
router.post('/', async (req, res) => {
  try {
    const { brand, model, year, price, mileage, fuel_type, color, description, image_url } = req.body;

    const [result] = await db.query(
      'INSERT INTO tricycles (brand, model, year, price, mileage, fuel_type, color, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, year, price, mileage, fuel_type, color, description, image_url]
    );

    res.status(201).json({ message: 'Tricycle added successfully', tricycleId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tricycle
router.put('/:id', async (req, res) => {
  try {
    const { brand, model, year, price, mileage, fuel_type, color, description, image_url, status } = req.body;

    const [result] = await db.query(
      'UPDATE tricycles SET brand = ?, model = ?, year = ?, price = ?, mileage = ?, fuel_type = ?, color = ?, description = ?, image_url = ?, status = ? WHERE id = ?',
      [brand, model, year, price, mileage, fuel_type, color, description, image_url, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tricycle not found' });
    }

    res.json({ message: 'Tricycle updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tricycle
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tricycles WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tricycle not found' });
    }

    res.json({ message: 'Tricycle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
