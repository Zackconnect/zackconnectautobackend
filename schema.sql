-- Create database
CREATE DATABASE IF NOT EXISTS zackconnect_autos;
USE zackconnect_autos;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mileage INT,
  fuel_type VARCHAR(20),
  transmission VARCHAR(20),
  color VARCHAR(30),
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tricycles table
CREATE TABLE IF NOT EXISTS tricycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mileage INT,
  fuel_type VARCHAR(20),
  color VARCHAR(30),
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  enquiry_type VARCHAR(50),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  preferred_method VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@zackconnect.com', '$2a$10$YourHashedPasswordHere', 'admin');
