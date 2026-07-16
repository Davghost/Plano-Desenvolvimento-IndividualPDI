const admin = require('../config/firebase');
import prisma from "../lib/prisma.js"

async function enviarPush(userId, titulo, corpo) {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true }
  });

  if (tokens.length === 0) return null;

  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokens.map(t => t.token),
    notification: { title: titulo, body: corpo }
  });

  // opcional: remover tokens inválidos/expirados
  response.responses.forEach((resp, idx) => {
    if (!resp.success) {
      prisma.deviceToken.delete({ where: { token: tokens[idx].token } }).catch(() => {});
    }
  });

  return response;
}

module.exports = { enviarPush };