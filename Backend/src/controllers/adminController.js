import { getAllUsersFiltered, getUserPDI} from '../services/adminService.js';

export async function GetAllUsersFilter(req, res) {
    try {
        const { id, name, turma } = req.query;
        const filters = {};

        if (id !== undefined) {
            const parsedId = Number(id);
            if (!Number.isInteger(parsedId)) {
                return res.status(400).json({
                    error: "O campo 'id' deve ser um número inteiro",
                    success: false
                });
            }
            filters.id = parsedId;
        }

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({
                    error: "O campo 'name' deve ser uma string válida",
                    success: false
                });
            }
            filters.name = name.trim();
        }

        if (turma !== undefined) {
            if (typeof turma !== 'string' || turma.trim() === '') {
                return res.status(400).json({
                    error: "O campo 'turma' deve ser uma string válida",
                    success: false
                });
            }
            filters.turma = turma.trim();
        }

        const result = await getAllUsersFiltered(filters);

        if (result.total === 0) {
            return res.status(200).json({
                message: "Não existe usuário com essas características.",
                users: [],
                total: 0,
                success: false
            });
        }

        return res.status(200).json({ ...result, success: true });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: "Falha ao buscar usuários",
            success: false
        });
    }
}

export async function getUserPDIController(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "ID de usuário inválido",success: false });
        }

        const pdiItems = await getUserPDI(userId);
        res.json(pdiItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar PDI do usuário" });
    }
}