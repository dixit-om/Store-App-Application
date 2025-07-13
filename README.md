# Store Rating Application

A full-stack web application that allows users to submit ratings for stores registered on the platform. Built with Express.js, React, and PostgreSQL.

## Features

### System Administrator
- Dashboard with statistics (total users, stores, ratings)
- Add new users, stores, and admin users
- View and filter users and stores
- User management with role-based access
- Store management with owner assignment

### Normal User
- User registration and login
- View all registered stores
- Search stores by name and address
- Submit and modify ratings (1-5 stars)
- Update password functionality

### Store Owner
- Dashboard with store statistics
- View customer ratings and feedback
- Rating distribution analysis
- Update password functionality

## Tech Stack

- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL (Neon Cloud)
- **Frontend**: React.js with Tailwind CSS
- **Authentication**: JWT tokens
- **Validation**: Express-validator
- **UI Components**: Lucide React icons

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (Neon Cloud)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Database Setup**
   - The application uses Neon PostgreSQL cloud database
   - Database URL is already configured in `server/config.env`
   - Run the migration to create tables:
   ```bash
   cd server
   npm run db:migrate
   ```

4. **Environment Configuration**
   - The database connection is already configured
   - Default admin user: `admin@storeapp.com` / `Admin@123`

## Running the Application

### Development Mode
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend server
cd server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/password` - Update password
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users with filters
- `POST /api/admin/users` - Add new user
- `GET /api/admin/users/:id` - Get user details
- `GET /api/admin/stores` - Get all stores with filters
- `POST /api/admin/stores` - Add new store

### Store Routes (Normal Users)
- `GET /api/stores` - Get stores with search/filter
- `POST /api/stores/:storeId/rate` - Submit rating
- `GET /api/stores/:storeId/rating` - Get user's rating

### Store Owner Routes
- `GET /api/store-owner/dashboard` - Store dashboard
- `GET /api/store-owner/stats` - Store statistics

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(60), min 20 chars)
- `email` (VARCHAR(255), UNIQUE)
- `password` (VARCHAR(255), hashed)
- `address` (VARCHAR(400))
- `role` (ENUM: 'admin', 'user', 'store_owner')
- `created_at`, `updated_at` (TIMESTAMP)

### Stores Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `email` (VARCHAR(255), UNIQUE)
- `address` (VARCHAR(400))
- `owner_id` (FOREIGN KEY to users.id)
- `created_at`, `updated_at` (TIMESTAMP)

### Ratings Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (FOREIGN KEY to users.id)
- `store_id` (FOREIGN KEY to stores.id)
- `rating` (INTEGER, 1-5)
- `created_at`, `updated_at` (TIMESTAMP)
- UNIQUE constraint on (user_id, store_id)

## Form Validations

### User Registration/Update
- **Name**: 20-60 characters
- **Email**: Valid email format
- **Password**: 8-16 characters, uppercase + special character
- **Address**: Max 400 characters

### Rating Submission
- **Rating**: Integer between 1-5

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers

## Default Users

### Admin User
- Email: `admin@storeapp.com`
- Password: `Admin@123`
- Role: Administrator

## Project Structure

```
store-rating-app/
├── server/                 # Backend Express.js application
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication and validation
│   ├── routes/           # API route handlers
│   ├── scripts/          # Database migration
│   └── index.js          # Main server file
├── client/               # Frontend React application
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── index.js      # Main React file
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 