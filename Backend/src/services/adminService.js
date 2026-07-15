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

export async function getUsersPaginated(page = 1, limit = 8) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: { role: "user" },
            include: { pdiItems: true },
            skip,
            take: limit,
            orderBy: { id: 'asc' }
        }),
        prisma.user.count({
            where: { role: "user" }
        })
    ]);

    return {
        users,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
}