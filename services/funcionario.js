const database = require('../repositories/funcionariosDB');
async function criaFuncionario(funcionario) {
    const funcionarioExistente = await database.buscaFuncionarioPorEmail(funcionario.email);
    if (funcionarioExistente) {
        throw new Error('Funcionário já cadastrado com esse email');
    }

    return await database.adicionaFuncionario(funcionario);
}

async function atualizaFuncionario(id, novosDados) {
    const funcionarioAtualizado = await database.atualizaFuncionario(id, novosDados);
    if (!funcionarioAtualizado) {
        throw new Error('Erro ao atualizar funcionário');
    }
    return funcionarioAtualizado;
}

async function deletaFuncionario(id) {
    const resultado = await database.deletaFuncionario(id);
    if (!resultado) {
        throw new Error('Erro ao deletar funcionário');
    }
    return { mensagem: 'Funcionário deletado com sucesso' };
}

async function retornaTodosFuncionarios(){
    const funcionarios = await database.retornaTodosFuncionarios();
    if (!funcionarios) {
        throw new Error('Erro ao buscar funcionários');
    }
    return funcionarios;
}

async function buscaFuncionarioPorId(id){
    const funcionario = await database.buscaFuncionarioPorId(id);
    if (!funcionario) {
        throw new Error('Funcionário não encontrado');
    }
    return funcionario;
}

module.exports = {
    criaFuncionario,
    atualizaFuncionario,
    deletaFuncionario,
    retornaTodosFuncionarios,
    buscaFuncionarioPorId
};


