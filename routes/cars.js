const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all cars
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cars WHERE status = $1 ORDER BY created_at DESC', ['available']);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get car by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new car (admin only)
router.post('/', async (req, res) => {
  try {
    const { make, model, year, price, mileage, fuel_type, transmission, color, description, image_url } = req.body;

    const result = await db.query(
      'INSERT INTO cars (make, model, year, price, mileage, fuel_type, transmission, color, description, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [make, model, year, price, mileage, fuel_type, transmission, color, description, image_url]
    );

    res.status(201).json({ message: 'Car added successfully', carId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car
router.put('/:id', async (req, res) => {
  try {
    const { make, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status } = req.body;

    const result = await db.query(
      'UPDATE cars SET make = $1, model = $2, year = $3, price = $4, mileage = $5, fuel_type = $6, transmission = $7, color = $8, description = $9, image_url = $10, status = $11 WHERE id = $12',
      [make, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM cars WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
