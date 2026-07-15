import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getAllUsersController } from '../controllers/adminController.js';

const router = express.Router();

// Middleware para verificar se é admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
    }
    next();
};

router.get('/users', authMiddleware, adminOnly, getAllUsersController);

export default router;