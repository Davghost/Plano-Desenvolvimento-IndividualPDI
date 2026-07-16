import prisma from "../lib/prisma.js"


async function CreateNotificationService(id_user, data) {
    try {
        const existingNotification = await prisma.notification.findFirst({
            where: {
                userId: id_user,
                expiresAt: { gt: new Date() },
            },
        });

        if (existingNotification) {
            throw new Error("Já existe uma notificação ativa para este usuário");
        }

        const notification = await prisma.notification.create({
            data: {
                userId: id_user,
                link: data.link,
                message: data.message,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        return notification;
    } catch (error) {
        console.error("Erro ao criar notificação:", error);
        throw error;
    }
}

async function UpdateNotificationService(id_notification, data) {
    try {
        const notification = await prisma.notification.update({
            where: { id: id_notification },
            data: {
                link: data.link,
                message: data.message,
            },
        });

        return notification;
    } catch (error) {
        console.error("Erro ao atualizar notificação:", error);
        throw error;
    }
}

async function DeleteNotificationService(id_notification) {
    try {
        const notification = await prisma.notification.delete({
            where: { id: id_notification },
        });

        return notification;
    } catch (error) {
        console.error("Erro ao deletar notificação:", error);
        throw error;
    }
}

async function GetNotificationsService(id_user) {
    try {
        await prisma.notification.deleteMany({
            where: {
                userId: id_user,
                expiresAt: { lte: new Date() },
            },
        });

        const notifications = await prisma.notification.findMany({
            where: { userId: id_user },
            orderBy: { created_at: "desc" },
        });

        return notifications;
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        throw error;
    }
}

export default {CreateNotificationService, UpdateNotificationService, DeleteNotificationService, GetNotificationsService};