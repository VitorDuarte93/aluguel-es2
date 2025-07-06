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

module.exports = {
    criaFuncionario,
    atualizaFuncionario,
    deletaFuncionario
};


