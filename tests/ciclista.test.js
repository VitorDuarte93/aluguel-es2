const validacao = require('./validacao');
const ciclistaDB = require("../repositories/acessoDB/ciclistaDB");

async function cadastrarCiclista(ciclista, meioDePagamento) {
    try {
        validacao.validarEmail(ciclista.email);
        validacao.validarCPF(ciclista.cpf);
        const emailExistente = await ciclistaDB.existeEmail(ciclista.email);
        if (emailExistente) {
            throw new Error('Email já cadastrado');
        }
        const novoCiclista = await ciclistaDB.criarCiclista(ciclista, meioDePagamento);
        return novoCiclista;
    } catch (error) {
        throw new Error('Erro ao cadastrar ciclista: ' + error.message);
    }
}

async function alteraCiclista(idCiclista) {
    try {
        return await ciclistaDB.atualizarCiclista(idCiclista);
    } catch (error) {
        throw new Error('Erro ao atualizar ciclista: ' + error.message);
    }
}

async function recuperaCiclista(idCiclista) {
    try {
        const ciclista = await ciclistaDB.obterCiclista(idCiclista);
        if (!ciclista) {
            throw new Error('Ciclista não encontrado');
        }
        return ciclista;
    } catch (error) {
        throw new Error('Erro ao recuperar ciclista: ' + error.message);
    }
}

async function ativarCiclista(idCiclista) {
    try {
        return await ciclistaDB.ativarCiclista(idCiclista);
    } catch (error) {
        throw new Error('Erro ao ativar ciclista: ' + error.message);
    }
}

async function existeEmail(email) {
    try {
        return await ciclistaDB.existeEmail(email);
    } catch (error) {
        throw new Error('Erro ao verificar email: ' + error.message);
    }
}

async function removerCiclista(idCiclista) {
    try {
        return await ciclistaDB.deletarCiclista(idCiclista);
    } catch (error) {
        throw new Error('Erro ao remover ciclista: ' + error.message);
    }
}

module.exports = {
    createCiclista: cadastrarCiclista,
    updateCiclista: alteraCiclista,
    getCiclistaById: recuperaCiclista,
    activateCiclista: ativarCiclista,
    emailExists: existeEmail,
    removeCiclista: removerCiclista // <- ADICIONADO
};
