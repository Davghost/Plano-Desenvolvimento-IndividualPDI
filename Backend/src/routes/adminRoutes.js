import express from 'express';
import Middlewares from '../middlewares/authMiddleware.js';
import UsersForAdmin from "../controllers/adminController.js";
import Notifications from '../controllers/notification.js';

const router = express.Router();


router.use(Middlewares.authMiddleware, Middlewares.adminOnly);
router.get('/filter', UsersForAdmin.GetAllUsersFilter);
router.get('/users/filter', UsersForAdmin.GetAllUsersFilter);
router.get('/users/:userId', UsersForAdmin.getUserPDIController);
router.post("notification/create", Notifications.CreateNotificationController);

export default router;
