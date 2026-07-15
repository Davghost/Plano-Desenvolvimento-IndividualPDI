import  prisma  from "../lib/prisma.js"
import { registerPDISchema, updatePDISchema } from "../validators/PDIValidator.js"

export async function RegisterPDIService(id_user, data) {
	const parsed = registerPDISchema.safeParse(data)
	if (!parsed.success) {
		const messages = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ')
		const validationError = new Error(`Dados inválidos: ${messages}`)
		validationError.statusCode = 400
		throw validationError
	}

	try {

        //retorna {sucess: boolean, data: {...}}
		const parsed = registerPDISchema.safeParse(data)

		if (!parsed.success) {
			const messages = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ')
			throw new Error(`Dados inválidos: ${messages}`)
		}

		const created = []
		const errors = []

		for (const item of parsed.data.pdiItems) {
			try {
				const res = await prisma.pdiItem.upsert({
					where: {
						userId_theme: {
							userId: id_user,
							theme: item.theme
						}
					},
					update: {
						objective: item.objective,
						why: item.why,
						how: item.how,
						period: item.period,
						who: item.who
					},
					create: {
						theme: item.theme,
						objective: item.objective,
						why: item.why,
						how: item.how,
						period: item.period,
						who: item.who,
						userId: id_user
					}
				})

			} catch (err) {
				errors.push({ theme: item.theme, message: err.message })
			}

		}

		return { success: true, created, errors: errors.length ? errors : undefined }
        console.log(created)
        console.log("funcionou")
        console.log(errors)
	} catch (err) {
		throw new Error(err.message)
	}

}

export async function UpdatePDIService(id_user, items) {
    // items: array de objetos no formato { theme: string, data: object }

    const updated = []
    const errors = []

    for (const item of items) {
        try {
            // valida os dados de atualização desse item específico
            const parsed = updatePDISchema.safeParse(item.data)
            if (!parsed.success) {
                const messages = parsed.error.issues
                    .map(e => `${e.path.join('.')}: ${e.message}`)
                    .join(' | ')
                throw new Error(`Dados inválidos: ${messages}`)
            }

            // verifica se o item existe e pertence a esse usuário
            const existing = await prisma.pdiItem.findUnique({
                where: {
                    userId_theme: {
                        userId: id_user,
                        theme: item.theme
                    }
                }
            })

            if (!existing) {
                throw new Error('PDI não encontrado para este usuário e tema')
            }

            const res = await prisma.pdiItem.update({
                where: { id: existing.id },
                data: parsed.data
            })

            updated.push(res)
        } catch (err) {
            errors.push({ theme: item.theme, message: err.message })
        }
    }

    return { success: errors.length === 0, updated, errors }
}

export async function GetPDIService(id_user) {
    try {
        const items = await prisma.pdiItem.findMany({ where: { userId: id_user } })
        return { success: true, pdiItems: items }
    } catch (err) {
        throw new Error(err.message)
    }
}
