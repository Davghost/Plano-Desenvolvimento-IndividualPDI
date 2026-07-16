import express from 'express';
import Middlewares from '../middlewares/authMiddleware.js';
import UsersForAdmin from "../controllers/adminController.js";
import Notifications from '../controllers/notificationController.js';

const router = express.Router();


router.use(Middlewares.authMiddleware, Middlewares.adminOnly);
router.get('/filter', UsersForAdmin.GetAllUsersFilter);
router.get('/users/filter', UsersForAdmin.GetAllUsersFilter);
router.get('/users/:userId', UsersForAdmin.getUserPDIController);

router.post("/notification/create", Notifications.CreateNotificationController);
router.put("/notification/update/:id", Notifications.UpdateNotificationController);
router.delete("/notification/delete/:id", Notifications.DeleteNotificationController);
router.get("/notification/user/:id", Notifications.GetNotificationByidController);

export default router;
