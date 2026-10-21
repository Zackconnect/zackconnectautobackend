const express = require('express');
const router = express.Router();
const db = require('../config/database');
const requireAdmin = require('../middleware/requireAdmin');

// Submit contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, enquiryType, subject, message, preferredMethod } = req.body;
    const storedMessage = enquiryType === 'import' && req.body.fields
      ? JSON.stringify(req.body.fields)
      : message;

    const result = await db.query(
      'INSERT INTO contact_messages (name, email, phone, enquiry_type, subject, message, preferred_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, email, phone, enquiryType, subject, storedMessage, preferredMethod]
    );

    res.status(201).json({ message: 'Message sent successfully', messageId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contact messages (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact message
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
