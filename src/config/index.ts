import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration object.
 * Contains server port, MongoDB connection URI, JWT secrets, token expiry, and email settings.
 */
export const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cortex-backend',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
  jwtExpiry: '15m',
  refreshTokenExpiry: '7d',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password',
    },
  },
};