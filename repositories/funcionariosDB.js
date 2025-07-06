const fs = require('fs/promises');
const path = require('path');

const dbFuncionario = path.join(__dirname, 'funcionarios.json');

//Seleciona a bicicleta associada à tranca informada

async function buscaFuncionarioPorId(idFuncionario){
    try {
        const raw = await fs.readFile(dbFuncionario, 'utf-8');
        const funcionarios = JSON.parse(raw).funcionarios;

        const funcionario = funcionarios.find(c => c.id === idFuncionario);
        if (!funcionario) {
            throw new Error('Funcionário não encontrado');
        }

        return funcionario;
    } catch (error) {
        throw new Error('Erro ao buscar funcionário: ' + error.message);
    }
}

async function buscaFuncionarioPorEmail(email) {
    try {
        const raw = await fs.readFile(dbFuncionario, 'utf-8');
        const funcionarios = JSON.parse(raw).funcionarios;

        const funcionario = funcionarios.find(c => c.email === email);
        if (!funcionario) {
            throw new Error('Funcionário não encontrado');
        }

        return funcionario;
    } catch (error) {
        throw new Error('Erro ao buscar funcionário: ' + error.message);
    }
}

async function adicionaFuncionario(senha, email, nome, idade, funcao, cpf){
    try {
        const raw = await fs.readFile(dbFuncionario, 'utf-8');
        const funcionarios = JSON.parse(raw).funcionarios;

        // Verifica se o funcionário já existe
        const funcionarioExistente = funcionarios.find(f => f.email === email);
        if (funcionarioExistente) {
            throw new Error('Funcionário já cadastrado com esse email');
        }

        let matricula = "F";
        let num = funcionarios.length + 1;
        num = num.toString();
        matricula = matricula + num;


        // Cria novo funcionário
        const novoFuncionario = {
            matricula,
            senha,
            email,
            nome,
            idade,
            funcao,
            cpf
        };

        funcionarios.push(novoFuncionario);
        await fs.writeFile(dbFuncionario, JSON.stringify({ funcionarios }, null, 2));

        return novoFuncionario;
    } catch (error) {
        throw new Error('Erro ao adicionar funcionário: ' + error.message);
    }
}

async function atualizaFuncionario(id, novosDados) {
    try {
        const raw = await fs.readFile(dbFuncionario, 'utf-8');
        const funcionarios = JSON.parse(raw).funcionarios;

        const funcionarioIndex = funcionarios.findIndex(f => f.id === id);
        if (funcionarioIndex === -1) {
            throw new Error('Funcionário não encontrado');
        }

        // Atualiza os dados do funcionário
        funcionarios[funcionarioIndex] = {
            ...funcionarios[funcionarioIndex],
            ...novosDados
        };

        await fs.writeFile(dbFuncionario, JSON.stringify({ funcionarios }, null, 2));

        return funcionarios[funcionarioIndex];
    } catch (error) {
        throw new Error('Erro ao atualizar funcionário: ' + error.message);
    }
}

async function deletaFuncionario(idFuncionario){
    try {
        const raw = await fs.readFile(dbFuncionario, 'utf-8');
        const funcionarios = JSON.parse(raw).funcionarios;

        const funcionarioIndex = funcionarios.findIndex(f => f.id === idFuncionario);
        if (funcionarioIndex === -1) {
            throw new Error('Funcionário não encontrado');
        }

        // Remove o funcionário
        funcionarios.splice(funcionarioIndex, 1);

        await fs.writeFile(dbFuncionario, JSON.stringify({ funcionarios }, null, 2));

        return { mensagem: 'Funcionário deletado com sucesso' };
    } catch (error) {
        throw new Error('Erro ao deletar funcionário: ' + error.message);
    }
}

module.exports = {
    buscaFuncionarioPorId,
    buscaFuncionarioPorEmail,
    adicionaFuncionario,
    atualizaFuncionario,
    deletaFuncionario
}