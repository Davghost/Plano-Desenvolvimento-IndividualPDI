import "dotenv/config"
import express from "express"
import cors from "cors"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import pushRoutes from "./routes/pushRoutes.js";

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

app.use("/auth", authRoutes)
app.use("/user",  userRoutes);
app.use("/admin", adminRoutes);
app.use("/api", pushRoutes);


app.get('/', (req, res) => {
    res.json({
        message: "Api funcionando"
    });
});

app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
});
