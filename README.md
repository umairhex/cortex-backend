# Cortex Backend

A production-ready Node.js Express backend with JWT authentication.

## Features

- User registration and login
- JWT access and refresh tokens
- Password reset via email
- Rate limiting for auth routes
- Security headers with Helmet
- Input validation with express-validator
- MongoDB with Mongoose

## API Endpoints

### Authentication

- `POST /api/signup` - Register new user
- `POST /api/signin` - Login user
- `POST /api/refresh` - Refresh access token
- `POST /api/logout` - Logout user
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password

### Protected Routes

- `GET /api/profile` - Get user profile (requires auth)

### Public Routes

- `GET /api/health` - Health check

## Environment Variables

Create a `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cortex-backend
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Installation

```bash
pnpm install
pnpm run build
pnpm start
```

## Development

```bash
pnpm run dev
```

## Security Features

- Password hashing with bcrypt
- JWT tokens with short expiry
- Refresh tokens for session renewal
- Rate limiting (5 attempts per 15 min)
- Helmet security headers
- Input sanitization and validation
- CORS enabled
