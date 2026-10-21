const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Submit contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, enquiryType, subject, message, preferredMethod } = req.body;

    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, phone, enquiry_type, subject, message, preferred_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, enquiryType, subject, message, preferredMethod]
    );

    res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const [messages] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact message
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
