const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all tricycles
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tricycles WHERE status = $1 ORDER BY created_at DESC', ['available']);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tricycle by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tricycles WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tricycle not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new tricycle (admin only)
router.post('/', async (req, res) => {
  try {
    const { brand, model, year, price, mileage, fuel_type, color, description, image_url } = req.body;

    const result = await db.query(
      'INSERT INTO tricycles (brand, model, year, price, mileage, fuel_type, color, description, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [brand, model, year, price, mileage, fuel_type, color, description, image_url]
    );

    res.status(201).json({ message: 'Tricycle added successfully', tricycleId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tricycle
router.put('/:id', async (req, res) => {
  try {
    const { brand, model, year, price, mileage, fuel_type, color, description, image_url, status } = req.body;

    const result = await db.query(
      'UPDATE tricycles SET brand = $1, model = $2, year = $3, price = $4, mileage = $5, fuel_type = $6, color = $7, description = $8, image_url = $9, status = $10 WHERE id = $11',
      [brand, model, year, price, mileage, fuel_type, color, description, image_url, status, req.params.id]
    );

    if (result.rowCount === 0) {
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
    const result = await db.query('DELETE FROM tricycles WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tricycle not found' });
    }

    res.json({ message: 'Tricycle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
