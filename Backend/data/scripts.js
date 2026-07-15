import prisma from "../src/lib/prisma.js";
import XLSX from "xlsx";
import bcrypt from "bcrypt";

async function importUsers() {

    // Lê o arquivo Excel
    const workbook = XLSX.readFile("./data/AlunosBA.xlsx");

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const alunos = XLSX.utils.sheet_to_json(sheet);


    // Senha padrão para todos
    const defaultPassword = "123456";

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);


    for (const aluno of alunos) {

        try {

            const nome = aluno.Nome.trim();
            const turma = String(aluno.Turma).trim();

            // Cria email baseado no nome
            // Ex: Marcos Vinicius -> marcos.vinicius@escola.com
            const email = `${nome
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replaceAll(" ", ".")
            }@gmail.com`;


            await prisma.user.create({

                data: {
                    name: nome,
                    turma: turma,
                    email: email,
                    password: hashedPassword,
                    role: "user"
                }

            });


            console.log(`Usuário criado: ${nome} - ${turma}`);


        } catch (error) {

            console.error(
                `Erro ao criar ${aluno.Nome}:`,
                error.message
            );

        }
    }
}


importUsers()
    .then(() => {
        console.log("Importação concluída!");
    })
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });