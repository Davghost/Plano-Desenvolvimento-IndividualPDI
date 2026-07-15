import { RegisterPDIService, GetPDIService, UpdatePDIService } from "../services/PDIService.js";


export async function RegisterPDIController(req, res) {
    const user_id = req.user?.sub;
    if (!user_id) {
        return res.status(500).json({ error: "Erro interno do servidor", success: false });
    }
    try {
        const response = await RegisterPDIService(user_id, req.body);
        return res.status(201).json(response);
    }
    catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({ error: error.message, success: false });
    }
}

export async function UpdatePDIController(req, res) {
    const id_user = req.user?.sub;

    if (!id_user) {
        return res.status(401).json({
            error: "Usuário não autenticado.",
            success: false
        });
    }

    const bodyItems = Array.isArray(req.body) ? req.body : [req.body];

    const result = await UpdatePDIService(id_user, bodyItems.map(data => ({ data })));

    if (!result.success) {
        return res.status(400).json({
            error: result.errors[0]?.message || "Erro ao atualizar PDI.",
            success: false,
            errors: result.errors
        });
    }

    return res.status(200).json({
        success: true,
        data: result.updated
    });
}

export async function GetMePDIController(req, res) {
    const user_id = req.user.sub;
    if (!user_id) {
        return res.status(500).json({
            error: "Erro interno do servidor",
            success: false
        });
    }
    try {
        const response = await GetPDIService(user_id);

        return res.status(200).json({
            success: true,
            pdiItems: response.pdiItems
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error.message,
            success: false
        });
    }
}