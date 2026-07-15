//import  prisma  from "../lib/prisma.js"
import { RegisterPDIService, UpdatePDIService, GetPDIService } from "./PDIService.js";

const user_id = 5

const data = {
    pdiItems:
    [
        {
        theme: "PROGRAMACAO",
        objective: "Aprender python",
        why: "Para estagiar",
        how: "Estudando 8 horas por dia",
        period: "SEMANAL",
        who: "Thiago",
        },
        {
        theme: "MATEMATICA",
        objective: "Aprednder python",
        why: "Para estagidar",
        how: "Estudando 8 hoddras por dia",
        period: "MENSAL",
        who: "Thiagod",
        },
    ]
    
}

const result = await RegisterPDIService(user_id, data)