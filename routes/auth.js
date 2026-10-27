const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const genericResetMessage = 'If an account exists for that email, a password reset link will be sent.';
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordResetMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !from) {
    throw new Error('Password reset email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.');
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user, pass }
    }),
    from
  };
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, phone]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request a one-time password reset link.
router.post('/forgot-password', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!validEmail.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      console.error('Password reset email is not configured. Set FRONTEND_URL.');
      return res.status(503).json({ message: 'Password reset is temporarily unavailable. Please try again later.' });
    }
    let mailer;
    try {
      mailer = passwordResetMailer();
    } catch (error) {
      console.error(error.message);
      return res.status(503).json({ message: 'Password reset is temporarily unavailable. Please try again later.' });
    }
    const userResult = await db.query('SELECT id, email FROM users WHERE LOWER(email) = $1', [email]);
    if (userResult.rowCount === 0) {
      return res.json({ message: genericResetMessage });
    }

    const user = userResult.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password.html?token=${token}`;

    const tokenResult = await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 minutes')
       ON CONFLICT (user_id) DO UPDATE
       SET token_hash = EXCLUDED.token_hash,
           expires_at = EXCLUDED.expires_at,
           created_at = NOW()
       WHERE password_reset_tokens.created_at <= NOW() - INTERVAL '1 minute'
       RETURNING user_id`,
      [user.id, tokenHash]
    );
    if (tokenResult.rowCount === 0) {
      return res.json({ message: genericResetMessage });
    }

    try {
      await mailer.transporter.sendMail({
        from: mailer.from,
        to: user.email,
        subject: 'Reset your Zackconnect Autos password',
        text: `Use this link to reset your Zackconnect Autos password. The link expires in 30 minutes and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
      });
    } catch (error) {
      await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
      console.error('Could not send password reset email:', error);
      return res.status(503).json({ message: 'Unable to send a password reset email right now. Please try again later.' });
    }

    return res.json({ message: genericResetMessage });
  } catch (error) {
    console.error('Password reset request failed:', error);
    return res.status(500).json({ message: 'Unable to process the password reset request.' });
  }
});

// Consume the reset token once and replace the user's password.
router.post('/reset-password', async (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ message: 'This password reset link is invalid or has expired. Request a new one.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Your password must be at least 8 characters.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  let client;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'This password reset link is invalid or has expired. Request a new one.' });
    }

    const userId = result.rows[0].user_id;
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );
    await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    await client.query('COMMIT');

    return res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(rollbackError => {
      console.error('Could not roll back password reset:', rollbackError);
    });
    console.error('Password reset failed:', error);
    return res.status(500).json({ message: 'Unable to reset the password. Please try again.' });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
