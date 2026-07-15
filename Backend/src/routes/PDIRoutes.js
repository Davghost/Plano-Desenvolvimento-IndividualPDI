import express from "express"

import { validate } from "../middlewares/validateMiddlewares.js"
import { authMiddleware, onlyUsers } from "../middlewares/authMiddleware.js"
import { RegisterPDIController,  UpdatePDIController, GetMePDIController } from "../controllers/PDIController.js";
import { pdiItemSchema, registerPDISchema, updatePDISchema } from "../validators/PDIValidator.js";

const router = express.Router()

router.use(authMiddleware);

router.get("/me", authMiddleware, onlyUsers, GetMePDIController);

router.post("/register", authMiddleware, onlyUsers, validate(registerPDISchema), RegisterPDIController);

router.put("/update", authMiddleware, onlyUsers, validate(updatePDISchema), UpdatePDIController);


export default router