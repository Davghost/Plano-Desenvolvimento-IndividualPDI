import express from 'express';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';
import { getAllUsersController } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', authMiddleware, adminOnly, getAllUsersController);

export default router;