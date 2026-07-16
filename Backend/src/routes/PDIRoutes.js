import express from "express"

import { validate } from "../middlewares/validateMiddlewares.js"
import { authMiddleware, onlyUsers } from "../middlewares/authMiddleware.js"
import { RegisterPDIController,  UpdatePDIController, GetMePDIController } from "../controllers/PDIController.js";
import { pdiItemSchema, registerPDISchema, updatePDISchema } from "../validators/PDIValidator.js";

const router = express.Router()

router.use(authMiddleware);
router.use(onlyUsers);


router.get("/me", GetMePDIController);

router.post("/register",  RegisterPDIController);

router.put("/update",  UpdatePDIController);


export default router