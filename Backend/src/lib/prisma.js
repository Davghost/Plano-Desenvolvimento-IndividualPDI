import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

dotenv.config()

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL // ex: "file:./dev.db"
})

const prisma = new PrismaClient({ adapter })

export default prisma