# Hostel Meal Feedback System

A comprehensive web application for managing hostel meal feedback with PostgreSQL database integration.

## Features

### For Students:
- Submit feedback for meals with ratings and suggestions
- View personal feedback history
- Dashboard with statistics

### For Admins:
- Manage meals (add, edit, delete)
- View and filter all feedback
- Analytics dashboard with insights
- User management

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing

## Setup Instructions

### 1. Database Setup

1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE hostel_meal_feedback;
   ```
3. Run the schema file to create tables:
   ```bash
   psql -d hostel_meal_feedback -f server/schema.sql
   ```

### 2. Environment Configuration

1. Copy the `.env` file and update with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hostel_meal_feedback
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3001
   ```

### 3. Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### 4. Running the Application

1. **Development mode** (runs both frontend and backend):
   ```bash
   npm run dev:full
   ```

2. **Frontend only**:
   ```bash
   npm run dev
   ```

3. **Backend only**:
   ```bash
   npm run dev:server
   ```

### 5. Default Credentials

The system comes with default test accounts:

- **Student**: `student@test.com` / `password`
- **Admin**: `admin@test.com` / `password`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Meals
- `GET /api/meals` - Get all meals (with optional filters)
- `POST /api/meals` - Create new meal (admin only)
- `PUT /api/meals/:id` - Update meal (admin only)
- `DELETE /api/meals/:id` - Delete meal (admin only)

### Feedback
- `GET /api/feedback` - Get feedback (with filters)
- `POST /api/feedback` - Submit feedback (students only)
- `GET /api/feedback/analytics` - Get analytics data (admin only)

## Database Schema

### Tables:
- `auth_users` - User authentication data
- `students` - Student profile information
- `admins` - Admin profile information
- `meals` - Meal information
- `feedback` - Feedback submissions with foreign key to meals

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API service functions
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js application
│   ├── routes/            # API route handlers
│   ├── auth.js            # Authentication logic
│   ├── database.js        # Database connection
│   └── schema.sql         # Database schema
└── package.json           # Dependencies and scripts
```

## Development Notes

- The frontend runs on `http://localhost:5173`
- The backend API runs on `http://localhost:3001`
- JWT tokens are stored in localStorage for authentication
- All passwords are hashed using bcrypt
- Foreign key relationships ensure data integrity