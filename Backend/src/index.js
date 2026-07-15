import "dotenv/config"
import express from "express"
import authRoutes from "./routes/authRoutes.js"
import PDIRoutes from "./routes/PDIRoutes.js"

const app = express()
const PORT = 3000

app.use(express.json())

app.use("/auth", authRoutes)
app.use("/pdi", PDIRoutes);

app.get('/', (req, res) => {
    res.json({
        message: "Api funcionando"
    });
});

app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
});