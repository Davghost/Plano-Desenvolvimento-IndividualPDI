import express from "express"

import {authMiddleware} from "../middlewares/authMiddleware.js"
import { RegisterPDIController,  UpdatePDIController, GetMePDIController } from "../controllers/PDIController.js";

const router = express.Router()
router.use(authMiddleware);


router.get("get/me", GetMePDIController);

router.post("/register", RegisterPDIController);

router.put("/update/:id", UpdatePDIController);


export default router