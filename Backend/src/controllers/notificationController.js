import notificationService from "../services/notificationService.js"
import WebPush from "../utils/webpush.js"

async function CreateNotificationController(req, res) {
    try {
        let { user_id, link, message } = req.body;
        user_id = parseInt(user_id, 10);
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({ error: "O ID fornecido é inválido.", success: false });
        }

        if (!link) {
            return res.status(400).json({ error: "link é obrigatório!", success : false});
        }

        if (!message) {
            message = "Olá, acesse o site para ver atualizações!";
        }

        const notification = await notificationService.CreateNotificationService(user_id, {
            link,
            message,
        });
        const data = {title : message, link : link};
        await WebPush(data);
        return res.status(201).json({ data: notification, success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message, success : false});
    }
}

async function UpdateNotificationController(req, res) {
    try {
        const id_notification = Number(req.params.id);

        if (!id_notification || isNaN(id_notification)) {
            return res.status(400).json({ error: "id_notification inválido", success: false });
        }

        const { link, message } = req.body;


        const notification = await notificationService.UpdateNotificationService(id_notification, {
            link: link || undefined,
            message: message || undefined,
        });
        
        const data = {title : message, link : link};
        await WebPush(data);

        return res.status(200).json({ data: notification, success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}

async function DeleteNotificationController(req, res) {
    try {
        const id_notification = Number(req.params.id);

        if (!id_notification || isNaN(id_notification)) {
            return res.status(400).json({ error: "id_notification inválido", success: false });
        }

        const notification = await notificationService.DeleteNotificationService(id_notification);

        return res.status(200).json({data : notification, success : true});
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}


async function GetNotificationMeController(req, res) {
    try {
        const id_user = req.user.sub;

        const notifications = await notificationService.GetNotificationByidUserService(id_user);

        return res.status(200).json({ data: notifications, success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}


async function GetAllNotificationsController(req, res) {
    try {
        const notifications = await notificationService.GetAllNotificationsService();

        return res.status(200).json({ notifications, success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}

async function GetNotificationByFilterController(req, res) {
    try {
        const { id, message, link, user_id } = req.query;

        const filters = {};

        if (id !== undefined) {
            const parsedId = Number(id);
            if (Number.isNaN(parsedId)) {
                return res.status(400).json({ message: "O campo 'id' deve ser um número válido." });
            }
            filters.id = parsedId;
        }

        if (message !== undefined) {
            if (typeof message !== "string" || message.trim() === "") {
                return res.status(400).json({ message: "O campo 'message' deve ser uma string válida." });
            }
            filters.message = message.trim();
        }

        if (link !== undefined) {
            if (typeof link !== "string" || link.trim() === "") {
                return res.status(400).json({ message: "O campo 'link' deve ser uma string válida." });
            }
            filters.link = link.trim();
        }
        if (user_id !== undefined) {
            const parsedUserId = Number(user_id);
            if (Number.isNaN(parsedUserId)) {
                return res.status(400).json({ message: "O campo 'user_id' deve ser um número válido." });
            }
            filters.userId = parsedUserId;
        }

        const notifications = await notificationService.GetNottificationsByFilterService(filters);

        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Erro ao buscar notificações por filtro:", error);
        return res.status(500).json({ message: "Erro interno ao buscar notificações." });
    }
}


export default {
    CreateNotificationController,
    UpdateNotificationController,
    DeleteNotificationController,
    GetNotificationMeController,
    GetAllNotificationsController,
    GetNotificationByFilterController
};