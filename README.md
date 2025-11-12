# LuxuryStay Hospitality - Backend

This is the backend server for the LuxuryStay Hospitality hotel management system, built with Node.js, Express, and MongoDB.

## Features

- RESTful API endpoints for hotel management operations
- User authentication and authorization with JWT
- MongoDB integration with Mongoose ODM
- Role-based access control system
- Room management with different room types and status tracking
- Reservation system with check-in/out functionality
- Billing and invoicing system
- Housekeeping and maintenance task management
- Analytics and reporting functionality
- Guest feedback system
- Service request management
- File upload handling

## Technologies Used

- Node.js (v18+)
- Express.js (latest)
- MongoDB with Mongoose ODM
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing
- express-validator for input validation
- Multer for file uploads
- Nodemailer for email functionality
- Cors for cross-origin resource sharing
- Morgan for logging
- Dotenv for environment variables management

## Prerequisites

- Node.js (v18+)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/masoom369/LuxuryStay_Hospitality_backend.git
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in `.env` file (see Environment Variables section below)

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root of the backend directory and add the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/luxurystay
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

- `PORT`: The port number for the server (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `EMAIL_*`: Email configuration for sending notifications (optional)

## Available Scripts

- `npm run dev`: Starts the development server with nodemon for auto-restart
- `npm start`: Starts the production server
- `npm test`: Runs tests (if any exist)
- `npm run lint`: Lints the codebase (if ESLint is configured)

## API Endpoints

The system follows a RESTful API design with endpoints organized by functionality:

- `/api/auth` - Authentication routes (login, register, profile)
- `/api/users` - User management (CRUD operations, role management)
- `/api/rooms` - Room management (CRUD operations, availability)
- `/api/reservations` - Reservation system (booking, check-in/out)
- `/api/billing` - Billing and invoices (create, update, payment)
- `/api/housekeeping` - Housekeeping tasks (assignments, status updates)
- `/api/maintenance` - Maintenance requests (report, status, scheduling)
- `/api/feedback` - Guest feedback (submit, view, respond)
- `/api/analytics` - Reporting and analytics (dashboard data)
- `/api/services` - Additional services (spa, restaurant, etc.)
- `/api/config` - System configuration (settings, rules)

## Database Models

The application uses Mongoose for object modeling with MongoDB. Key models include:

- User: Information about system users (staff and guests)
- Room: Details about hotel rooms
- Reservation: Booking information and dates
- Billing: Invoice and payment records
- Housekeeping: Cleaning tasks and schedules
- Maintenance: Maintenance requests and work orders
- Feedback: Guest feedback and reviews

## Security Measures

- Input validation and sanitization using express-validator
- Password hashing with bcrypt
- Secure JWT handling
- CORS configuration for cross-origin security
- Rate limiting for public endpoints
- Data privacy best practices

## Deployment

The backend can be deployed to platforms like Heroku, Railway, or similar Node.js hosting providers. Make sure to configure environment variables appropriately for the production environment.

## API Documentation

Detailed API documentation can be accessed via the `/api-docs` endpoint when the server is running (if Swagger is implemented).

## Support

For support or questions, please contact the development team or open an issue in the repository.
