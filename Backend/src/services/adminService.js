import prisma from '../lib/prisma.js';

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