import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.get('/me', authMiddleware, AuthController.me);

export default authRoutes;
