const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use('/api/cars', bodyParser.json({ limit: '30mb' }));
app.use('/api/tricycles', bodyParser.json({ limit: '30mb' }));
app.use('/api/site-content', bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/tricycles', require('./routes/tricycles'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/site-content', require('./routes/siteContent'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Zackconnect Autos API' });
});

async function startServer() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      content JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to initialize site content storage:', error);
  process.exit(1);
});
