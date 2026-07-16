import notificationService from "../services/notificationService.js"


async function CreateNotificationController(req, res) {
    try {
        let { user_id, link, message } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "user_id é obrigatório", success : false});
        }

        if (!link) {
            return res.status(400).json({ error: "link é obrigatório", success : false});
        }

        if (!message) {
            message = "Olá, acesse o site para ver atualizações!";
        }

        const notification = await notificationService.CreateNotificationService(user_id, {
            link,
            message,
        });

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

async function GetNotificationsController(req, res) {
    try {
        const id_user = Number(req.params.id);

        if (!id_user || isNaN(id_user)) {
            return res.status(400).json({ error: "id_user é obrigatório", success: false });
        }

        const notifications = await notificationService.GetNotificationsService(id_user);

        return res.status(200).json({ data: notifications, success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}


async function GetNotificationByidController(req, res) {
    let id_user = null;
    try {
        if(!req.path == "/notification/me"){
            id_user = Number(req.params.id);

            if (!id_user || isNaN(id_user)) {
                return res.status(400).json({ error: "id_user é obrigatório", success: false });
            }
        }
        else{
            id_user = req.user.sub;
        }


        const notifications = await notificationService.GetNotificationsService(id_user);

        return res.status(200).json({ data: notifications, success: true });
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}

export default {CreateNotificationController, UpdateNotificationController, DeleteNotificationController, GetNotificationByidController};