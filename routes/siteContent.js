const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdmin = require('../middleware/requireAdmin');
const { saveVehicleImages, sendVehicleImageError } = require('../utils/vehicleImages');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT content FROM site_content WHERE id = 1');
    res.json(result.rows[0]?.content || null);
  } catch (error) {
    console.error('Failed to load public site content:', error);
    res.status(500).json({ message: 'Could not load site content' });
  }
});

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT content FROM site_content WHERE id = 1');
    res.json(result.rows[0]?.content || null);
  } catch (error) {
    console.error('Failed to load admin site content:', error);
    res.status(500).json({ message: 'Could not load site content' });
  }
});

router.put('/admin', requireAdmin, async (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return res.status(400).json({ message: 'Site content must be an object' });
  }

  try {
    const result = await db.query(
      `INSERT INTO site_content (id, content, updated_at)
       VALUES (1, $1::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP
       RETURNING content`,
      [JSON.stringify(content)]
    );
    res.json(result.rows[0].content);
  } catch (error) {
    console.error('Failed to save admin site content:', error);
    res.status(500).json({ message: 'Could not save site content' });
  }
});

router.post('/admin/image', requireAdmin, async (req, res) => {
  if (typeof req.body.image !== 'string' || !req.body.image.startsWith('data:image/jpeg;base64,')) {
    return res.status(400).json({ message: 'Site images must be optimized JPEG data' });
  }

  try {
    const [image] = await saveVehicleImages([req.body.image]);
    res.status(201).json({ image });
  } catch (error) {
    console.error('Failed to save site content image:', error);
    if (sendVehicleImageError(res, error)) return;
    res.status(500).json({ message: 'Could not save site content image' });
  }
});

module.exports = router;
