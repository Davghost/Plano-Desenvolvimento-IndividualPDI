import express from "express"
import Middlewares from "../middlewares/authMiddleware.js"

const router = express.Router();


router.use(Middlewares.authMiddleware, Middlewares.onlyUsers);
router.get("/notification/me");

export default router;