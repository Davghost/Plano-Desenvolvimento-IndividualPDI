import express from "express"
import validate  from "../middlewares/validateMiddlewares.js"
import Middlewares from "../middlewares/authMiddleware.js"
import Pdi from "../controllers/PDIController.js";
import Notifications from '../controllers/notificationController.js';

const router = express.Router()

router.use(Middlewares.authMiddleware, Middlewares.onlyUsers);
router.get("/pdi/me", Pdi.GetMePDIController);
router.post("/pdi/register",  Pdi.RegisterPDIController);
router.put("/pdi/update",  Pdi.UpdatePDIController);

router.get("/notification/me", Notifications.GetNotificationByidController);

export default router