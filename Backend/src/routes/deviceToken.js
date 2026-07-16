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