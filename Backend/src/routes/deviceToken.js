import CreateNotificationService from "../services/notificationService"

router.post('/device-token', authMiddleware, async (req, res) => {
  const { token, platform } = req.body;
  const userId = req.user.id;

  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { userId, token, platform }
  });

  res.sendStatus(200);
});

const { enviarPush } = require('../services/pushService');

router.post('/admin/mensagem', authMiddleware, async (req, res) => {
  const { userId, texto } = req.body;
  const adminId = req.user.id;

  const mensagem = await CreateNotificationService(userId, texto); // função dele

  await enviarPush(mensagem.destinatario, "Nova mensagem do admin", mensagem.texto);

  res.json(mensagem);
});