const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all cars
router.get('/', async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars WHERE status = ? ORDER BY created_at DESC', ['available']);
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get car by ID
router.get('/:id', async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(cars[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new car (admin only)
router.post('/', async (req, res) => {
  try {
    const { make, model, year, price, mileage, fuel_type, transmission, color, description, image_url } = req.body;

    const [result] = await db.query(
      'INSERT INTO cars (make, model, year, price, mileage, fuel_type, transmission, color, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [make, model, year, price, mileage, fuel_type, transmission, color, description, image_url]
    );

    res.status(201).json({ message: 'Car added successfully', carId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car
router.put('/:id', async (req, res) => {
  try {
    const { make, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status } = req.body;

    const [result] = await db.query(
      'UPDATE cars SET make = ?, model = ?, year = ?, price = ?, mileage = ?, fuel_type = ?, transmission = ?, color = ?, description = ?, image_url = ?, status = ? WHERE id = ?',
      [make, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status, req.params.id]
    );

    if (result.affectedRows === 0) {
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
    const [result] = await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
