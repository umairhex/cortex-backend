import express from 'express';
import { getHealth } from './health.js';

const router: express.Router = express.Router();

router.get('/health', getHealth);

export default router;