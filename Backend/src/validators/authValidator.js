import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(8, "Nome deve ter no mínimo 8 caracteres"),
    password: z.string().min(12, "Senha deve ter no minímo 12 caracteres")
})

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(12, "Senha deve ter no mínimo 12 caracteres")
})