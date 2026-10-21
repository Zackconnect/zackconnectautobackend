# Zackconnect Autos Backend

Node.js and Supabase PostgreSQL backend API for Zackconnect Autos vehicle management system.

## Features

- User authentication (register/login with JWT)
- Cars management (CRUD operations)
- Tricycles management (CRUD operations)
- User management
- Contact form handling

## Prerequisites

- Node.js (v14 or higher)
- A Supabase project (PostgreSQL)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a Supabase project, then open **SQL Editor** in its dashboard and run the contents of `schema.sql` to create the tables.

3. Configure the environment variables in `.env`:
```
PORT=3000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
JWT_SECRET=your_jwt_secret_key
```

Get the connection string from your Supabase project's database settings. For Render, use the Supabase connection string intended for external/server connections. Replace any password placeholder with your database password, and keep the connection string private.

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

The PostgreSQL schema is defined in `schema.sql`. It creates the application tables; it does not migrate data from an existing MySQL database.

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
