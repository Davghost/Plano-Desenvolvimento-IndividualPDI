export async function RegisterPDIController(req,res){
    //RegisterPDi
}

export async function UpdatePDIController(req,res){
    if(!req.params.id){
        return res.status(400).json({
            error : "ID need to beThe 'id' parameter is required.",
            success : false
        });
    }

}

export async function GetMePDIController(req,res){
    //GetAllThemesPdi

}