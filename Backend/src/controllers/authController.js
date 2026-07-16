import authService from "../services/authService.js"

async function registerController(req, res){
    try{
        const { name, email, turma, password} = req.body

        const user = await authService.register({
            name, email, turma, password
        })

        return res.status(201).json(user)
    }catch(error){
        if(error.message==="EMAIL_EXISTS"){
            return res.status(409).json({
                error: "Email já cadastrado"
            })
        }

        console.log(error)
        return res.status(500).json(
            {error: "Erro interno do servidor"}
        )

    }
}

async function loginController(req, res){
    try{
        const {email, password} = req.body

        const result = await authService.login({
            email, password
        })
        return res.json({
            message: "Login efetuado com sucesso",
            ...result
        })
    }catch(error){
        if(error.message==="INVALID_CREDENTIALS"){
            return res.status(401).json({
                error: "Credenciais inválidas"
            })
        }

        console.log(error)

        return res.status(500).json({
            error: "Erro interno do servidor"
        })
}   
}


export default {registerController, loginController}