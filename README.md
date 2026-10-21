# Zackconnect Autos Backend

Node.js and MySQL backend API for Zackconnect Autos vehicle management system.

## Features

- User authentication (register/login with JWT)
- Cars management (CRUD operations)
- Tricycles management (CRUD operations)
- User management
- Contact form handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=zackconnect_autos
JWT_SECRET=your_jwt_secret_key
```

3. Create database and tables:
```bash
mysql -u root -p < schema.sql
```

Or manually run the SQL commands in `schema.sql` in your MySQL client.

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Cars

- `GET /api/cars` - Get all available cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Add new car (admin)
- `PUT /api/cars/:id` - Update car (admin)
- `DELETE /api/cars/:id` - Delete car (admin)

### Tricycles

- `GET /api/tricycles` - Get all available tricycles
- `GET /api/tricycles/:id` - Get tricycle by ID
- `POST /api/tricycles` - Add new tricycle (admin)
- `PUT /api/tricycles/:id` - Update tricycle (admin)
- `DELETE /api/tricycles/:id` - Delete tricycle (admin)

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Contact

- `POST /api/contact` - Submit contact message
- `GET /api/contact` - Get all messages (admin)
- `DELETE /api/contact/:id` - Delete message (admin)

## Database Schema

### Users
- id, name, email, password, phone, role, created_at, updated_at

### Cars
- id, make, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status, created_at, updated_at

### Tricycles
- id, brand, model, year, price, mileage, fuel_type, color, description, image_url, status, created_at, updated_at

### Contact Messages
- id, name, email, phone, message, created_at

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Add middleware to protect admin routes in production
# zackconnectautobackend
