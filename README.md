# Zackconnect Autos Backend

Node.js and Supabase PostgreSQL backend API for Zackconnect Autos vehicle management system.

## Features

- User authentication (register/login with JWT)
- Admin-protected car and tricycle management (CRUD operations)
- Shared database-backed homepage, category, announcement, and site-content settings
- Database-backed contact enquiries and vehicle import requests
- User management
- Contact form handling

## Prerequisites

- Node.js (v18 or higher)
- A Supabase project (PostgreSQL)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a Supabase project, then open **SQL Editor** in its dashboard and run the contents of `schema.sql` to create or update the tables.

3. Configure the environment variables in `.env`:
```
PORT=3000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
JWT_SECRET=your_jwt_secret_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_private_service_role_key
```

Get the connection string from your Supabase project's database settings. For Render, use the Supabase connection string intended for external/server connections. Replace any password placeholder with your database password, and keep the connection string private.

The backend creates a public Supabase Storage bucket named `vehicles` when the first vehicle or website image is uploaded. The Render backend must have valid `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables with permission to create buckets and upload objects. Keep the service-role key only in Render; never put it in frontend code. The server creates the `site_content` table at startup; `schema.sql` also includes it. The `ALTER TABLE` statements at the bottom of `schema.sql` migrate existing tables to the inventory fields used by the admin dashboard.

To grant admin access, first register the admin's account through the website, then run this SQL in Supabase SQL Editor, replacing the email:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
Log out and back in so the new JWT contains the admin role. Admin vehicle APIs require that role.

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

### Website content

- `GET /api/site-content` - Get public website settings
- `GET /api/site-content/admin` - Get dashboard settings (admin)
- `PUT /api/site-content/admin` - Save dashboard settings (admin)
- `POST /api/site-content/admin/image` - Upload a website image (admin)

## Database Schema

The PostgreSQL schema is defined in `schema.sql`. It creates the application tables; it does not migrate data from an existing MySQL database.

### Users
- id, name, email, password, phone, role, created_at, updated_at

### Cars
- id, make, model, year, price, mileage, fuel_type, transmission, color, description, image_url, status, created_at, updated_at

### Tricycles
- id, brand, model, year, price, mileage, fuel_type, color, description, image_url, status, created_at, updated_at

### Contact Messages
- Contact enquiries and import requests are saved in `contact_messages` and shown in the admin dashboard.

### Website Content
- Categories, homepage tiles, announcements, page copy/images, activity, and migrated browser-only submissions are saved as JSON in `site_content`.

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Dashboard settings and contact-message reads/deletes require an admin JWT
# zackconnectautobackend
