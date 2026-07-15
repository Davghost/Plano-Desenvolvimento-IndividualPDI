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

export async function getAllUsersFiltered(filters = {}) {
    const { id, name, turma } = filters;

    const where = { role: "user" };

    if (id !== undefined) {
        where.id = id;
    }

    if (name !== undefined) {
        where.name = { contains: name};
    }

    if (turma !== undefined) {
        where.turma = { contains: turma};
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            turma: true,
            role: true,
            pdiItems: true
        },
        orderBy: { id: 'asc' }
    });

    return {
        users,
        total: users.length
    };
}