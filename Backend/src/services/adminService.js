import prisma from '../lib/prisma.js';

const PDI_THEMES = [
    "PROGRAMACAO",
    "MATEMATICA",
    "INGLES",
    "SOFT_SKILLS",
    "OPORTUNIDADES_ACADEMICAS"
]

function buildFullPdiItems(items, userId) {
    const itemMap = new Map(items.map(item => [item.theme, item]))

    return PDI_THEMES.map(theme => {
        const item = itemMap.get(theme)
        return {
            id: item?.id ?? null,
            userId: item?.userId ?? userId,
            theme,
            objective: item?.objective ?? "",
            why: item?.why ?? "",
            how: item?.how ?? "",
            period: item?.period ?? null,
            who: item?.who ?? ""
        }
    })
}

export async function getAllUsersFiltered(filters = {}, page = 1, limit = 8) {
    const { id, name, turma } = filters;

    const where = { role: "user" };

    const skip = (page - 1) * limit;

    if (id !== undefined) {
        where.id = id;
    }

    if (name !== undefined) {
        where.name = { contains: name};
    }

    if (turma !== undefined) {
        where.turma = { contains: turma};
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                turma: true,
                role: true,
            },
            skip,
            take: limit,
            orderBy: { id: 'asc' }
        }),
        prisma.user.count({
            where
        })
    ]);

    return {
        users,
        total
    };  
};

export async function getUserPDI(userId) {
    const [user_data, items] = await Promise.all([
        prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                name: true,
                email: true,
                turma: true,
            }
        }),
        prisma.pdiItem.findMany({
            where: { userId },
            orderBy: { theme: 'asc' }
        })
    ]);
    console.log(items)
    return [user_data, buildFullPdiItems(items, userId)];
}