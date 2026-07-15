import express from 'express';
import { authMiddleware , adminOnly} from '../middlewares/authMiddleware.js';
import { getAllUsersController , GetAllUsersFilter} from '../controllers/adminController.js';

const router = express.Router();




router.get('/users', getAllUsersController);
router.get('/users/filter', GetAllUsersFilter);
export default router;