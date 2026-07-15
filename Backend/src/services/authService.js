import bcrypt from "bcryptjs"
import prisma from "../lib/prisma.js"
import { generateToken } from "../utils/jwt.js"

export async function register(data) {
    const {name, email, turma, password} = data

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
        where:{email: normalizedEmail}})

    if(existingUser){
        throw new Error("EMAIL_EXISTS")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data:{
            name,
            email: normalizedEmail,
            turma,
            password: hashedPassword,
            role: "user"
        },
        select:{
            id:true,
            name:true,
            email:true,
            turma: true,
            role: true,
            created_at: true
        }
    })
    return user
}

export async function login(data){
    const {email, password} = data

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
        where:{
            email: normalizedEmail
        }
    })

    if(!user){
        throw new Error(
            "INVALID_CREDENTIALS"
        )
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if(!passwordMatches){
        throw new Error(
            "INVALID_CREDENTIALS"
        )
    }

    const token = generateToken(user)

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        turma: user.turma,
        role: user.role,
        created_at: user.created_at
    }

    return {
        safeUser, token
    }
}
