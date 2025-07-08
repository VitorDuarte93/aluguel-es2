const database = require('../repositories/funcionariosDB');
const { criaFuncionario, atualizaFuncionario } = require('../services/funcionario');
const { beforeEach, describe, it, expect } = require('@jest/globals');

// Mocks
jest.mock('../repositories/funcionariosDB');

describe('criarFuncionario', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um funcionário com sucesso', async () => {
        database.adicionaFuncionario.mockResolvedValue({ id: '1', nome: 'João' });

        const result = await criaFuncionario({ nome: 'João', cargo: 'Gerente' });
        expect(result).toEqual({ id: '1', nome: 'João' });
        expect(database.adicionaFuncionario).toHaveBeenCalledWith({ nome: 'João', cargo: 'Gerente' });
    });

    it('deve lançar erro ao tentar criar um funcionário sem nome', async () => {
        await expect(criaFuncionario({ cargo: 'Gerente' })).rejects.toThrow('Nome é obrigatório');
    });
});

describe('atualizarFuncionario', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar um funcionário com sucesso', async () => {
        database.atualizaFuncionario.mockResolvedValue({ id: '1', nome: 'João Atualizado' });

        const result = await atualizaFuncionario('1', { nome: 'João Atualizado' });
        expect(result).toEqual({ id: '1', nome: 'João Atualizado' });
        expect(database.atualizaFuncionario).toHaveBeenCalledWith('1', { nome: 'João Atualizado' });
    });

    it('deve lançar erro se o funcionário não for encontrado', async () => {
        database.atualizaFuncionario.mockResolvedValue(null);

        await expect(atualizaFuncionario('999', { nome: 'Inexistente' })).rejects.toThrow('Funcionário não encontrado');
    });
});