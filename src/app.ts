import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Main Express application instance.
 * Configures middleware, routes, and error handling.
 */
const app: express.Application = express();

// Security headers
app.use(helmet());

// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Root route handler.
 * Responds with a simple greeting message.
 */
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Mount API routes under /api path
app.use('/api', routes);

// Handle 404 errors for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

export default app;