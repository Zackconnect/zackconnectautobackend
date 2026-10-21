const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdmin = require('../middleware/requireAdmin');
const { saveVehicleImages, sendVehicleImageError } = require('../utils/vehicleImages');

function tricycleFromRow(tricycle) {
  return {
    ...tricycle,
    images: tricycle.images?.length ? tricycle.images : (tricycle.image_url ? [tricycle.image_url] : [])
  };
}

// Get all tricycles
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tricycles WHERE status = $1 ORDER BY created_at DESC', ['available']);
    res.json(result.rows.map(tricycleFromRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tricycles ORDER BY created_at DESC');
    res.json(result.rows.map(tricycleFromRow));
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
    res.json(tricycleFromRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new tricycle (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      brand, model, year, price, mileage, fuel_type, color, description,
      images, vehicle_condition, tricycle_type, location, featured
    } = req.body;
    const savedImages = await saveVehicleImages(images);

    const result = await db.query(
      `INSERT INTO tricycles
        (brand, model, year, price, mileage, fuel_type, color, description, image_url,
         images, vehicle_condition, tricycle_type, location, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [
        brand, model, year, price, mileage, fuel_type, color, description,
        savedImages[0] || null, savedImages, vehicle_condition, tricycle_type, location, Boolean(featured)
      ]
    );

    res.status(201).json({ message: 'Tricycle added successfully', tricycleId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    if (sendVehicleImageError(res, error)) return;
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tricycle
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const {
      brand, model, year, price, mileage, fuel_type, color, description,
      images, vehicle_condition, tricycle_type, location, featured, status
    } = req.body;
    const savedImages = await saveVehicleImages(images);

    const result = await db.query(
      `UPDATE tricycles SET
        brand = $1, model = $2, year = $3, price = $4, mileage = $5, fuel_type = $6,
        color = $7, description = $8, image_url = $9, images = $10,
        vehicle_condition = $11, tricycle_type = $12, location = $13, featured = $14,
        status = $15, updated_at = CURRENT_TIMESTAMP
       WHERE id = $16`,
      [
        brand, model, year, price, mileage, fuel_type, color, description,
        savedImages[0] || null, savedImages, vehicle_condition, tricycle_type, location,
        Boolean(featured), status || 'available', req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tricycle not found' });
    }

    res.json({ message: 'Tricycle updated successfully' });
  } catch (error) {
    console.error(error);
    if (sendVehicleImageError(res, error)) return;
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tricycle
router.delete('/:id', requireAdmin, async (req, res) => {
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
