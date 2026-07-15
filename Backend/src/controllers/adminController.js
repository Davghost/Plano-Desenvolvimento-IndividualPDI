import { getUsersPaginated } from '../services/adminService.js';

export async function getAllUsersController(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        
        const result = await getUsersPaginated(page, limit);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
}