import express from "express"
import validate  from "../middlewares/validateMiddlewares.js"
import Middlewares from "../middlewares/authMiddleware.js"
import Pdi from "../controllers/PDIController.js";

const router = express.Router()

router.use(Middlewares.authMiddleware, Middlewares.onlyUsers);
router.get("/me", Pdi.GetMePDIController);
router.post("/register",  Pdi.RegisterPDIController);
router.put("/update",  Pdi.UpdatePDIController);

export default router