import express from 'express';
import { authMiddleware , adminOnly} from '../middlewares/authMiddleware.js';
import { GetAllUsersFilter, getUserPDIController} from '../controllers/adminController.js';

const router = express.Router();


router.use(authMiddleware);
router.use(adminOnly)

router.get('/filter', GetAllUsersFilter);
// Mantida temporariamente para clientes que ainda utilizam a rota anterior.
router.get('/users/filter', GetAllUsersFilter);
router.get('/users/:userId', getUserPDIController);
export default router;
