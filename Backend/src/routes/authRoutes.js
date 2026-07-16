import express from "express"
import auth from "../controllers/authController.js"
import validators from "../validators/authValidator.js"
import  validate  from "../middlewares/validateMiddlewares.js"

const router = express.Router()


router.post("/register", validate(validators.registerSchema), auth.registerController)
router.post("/login", validate(validators.loginSchema), auth.loginController)

export default router