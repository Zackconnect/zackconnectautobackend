const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdmin = require('../middleware/requireAdmin');
const { saveVehicleImages, sendVehicleImageError } = require('../utils/vehicleImages');

const sourceCountries = new Set(['china', 'usa', 'canada']);

function carFromRow(car) {
  return {
    ...car,
    images: car.images?.length ? car.images : (car.image_url ? [car.image_url] : [])
  };
}

// Get all cars
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cars WHERE status = $1 ORDER BY created_at DESC', ['available']);
    res.json(result.rows.map(carFromRow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cars ORDER BY created_at DESC');
    res.json(result.rows.map(carFromRow));
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
    res.json(carFromRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new car (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      make, model, year, price, mileage, fuel_type, transmission, color,
      description, images, vehicle_condition, listing_type, source_country, location, featured
    } = req.body;
    if (listing_type === 'import' && !sourceCountries.has(source_country)) {
      return res.status(400).json({ message: 'Choose China, USA, or Canada as the car source country.' });
    }
    const savedImages = await saveVehicleImages(images);
    const savedSourceCountry = listing_type === 'import' ? source_country : null;

    const result = await db.query(
      `INSERT INTO cars
        (make, model, year, price, mileage, fuel_type, transmission, color, description,
         image_url, images, vehicle_condition, listing_type, source_country, location, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id`,
      [
        make, model, year, price, mileage, fuel_type, transmission, color, description,
        savedImages[0] || null, savedImages, vehicle_condition, listing_type, savedSourceCountry, location, Boolean(featured)
      ]
    );

    res.status(201).json({ message: 'Car added successfully', carId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    if (sendVehicleImageError(res, error)) return;
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const {
      make, model, year, price, mileage, fuel_type, transmission, color,
      description, images, vehicle_condition, listing_type, source_country, location, featured, status
    } = req.body;
    if (listing_type === 'import' && !sourceCountries.has(source_country)) {
      return res.status(400).json({ message: 'Choose China, USA, or Canada as the car source country.' });
    }
    const savedImages = await saveVehicleImages(images);
    const savedSourceCountry = listing_type === 'import' ? source_country : null;

    const result = await db.query(
      `UPDATE cars SET
        make = $1, model = $2, year = $3, price = $4, mileage = $5, fuel_type = $6,
        transmission = $7, color = $8, description = $9, image_url = $10, images = $11,
        vehicle_condition = $12, listing_type = $13, source_country = $14, location = $15,
        featured = $16, status = $17, updated_at = CURRENT_TIMESTAMP
       WHERE id = $18`,
      [
        make, model, year, price, mileage, fuel_type, transmission, color, description,
        savedImages[0] || null, savedImages, vehicle_condition, listing_type, savedSourceCountry, location,
        Boolean(featured), status || 'available', req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error(error);
    if (sendVehicleImageError(res, error)) return;
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car
router.delete('/:id', requireAdmin, async (req, res) => {
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
