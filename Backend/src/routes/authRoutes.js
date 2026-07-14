import express from "express"
import { registerController, loginController } from "../controllers/authController.js"
import { registerSchema, loginSchema } from "../validators/authValidator.js"
import { validate } from "../middlewares/validateMiddlewares.js"

const router = express.Router()

router.post("/register", registerController, validate(registerSchema))

router.post("/login", loginController, validate(loginSchema))

export default router