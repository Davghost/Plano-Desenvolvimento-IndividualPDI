// src/routes/push.routes.js
import express from "express";
import prisma from "../lib/prisma.js"; // seu PrismaClient já instanciado
//import  authMiddleware  from "../middlewares/authMiddleware.js"; // seu middleware de auth
import Middlewares from '../middlewares/authMiddleware.js';
import sendPushToUser from "../services/pushNotificationsService.js";

const router = express.Router();

// Salva/atualiza o token FCM do usuário autenticado
router.post("/push/register-token", Middlewares.authMiddleware, async (req, res) => {
  const { token } = req.body;
  const userId = req.user.sub; // vindo do middleware de auth

  console.log("debug")
  console.log(token)
  console.log("debug")

  if (!token) {
    return res.status(400).json({ error: "Token é obrigatório." });
  }

  try {
    await prisma.pushToken.upsert({
      where: { token },
      update: { userId, userAgent: req.headers["user-agent"] },
      create: { token, userId, userAgent: req.headers["user-agent"] },
    });

    return res.status(200).json({ message: "Token registrado com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar token:", error);
    return res.status(500).json({ error: "Erro interno ao registrar token." });
  }
});

// Remove um token (ex: ao fazer logout ou revogar permissão)
router.delete("/push/unregister-token", Middlewares.authMiddleware, async (req, res) => {
  const { token } = req.body;
  try {
    const tok = await prisma.pushToken.findUnique({
      where: {token}
    })
    if(!tok){
      return res.status(400).json({message: "Token inválido"})
    }
    await prisma.pushToken.deleteMany({ where: { token } });
    return res.status(200).json({ message: "Token removido." });
  } catch (error) {
    console.error("Erro ao remover token:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.post("/push/sendMessage", Middlewares.authMiddleware, async (req, res) => {
  const data = req.body
  const result = await sendPushToUser(req.user.id, data)
  res.json(result);
});

export default router;