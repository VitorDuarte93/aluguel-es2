// tests/ciclistaService.test.js
const ciclistaService = require('../services/ciclista');
const db = require('../repositories/acessoDB/ciclistaDB');
const { beforeEach, describe, it, expect } = require('@jest/globals');

jest.mock('../repositories/ciclistaDB');

describe('ciclistaService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('createCiclista', () => {
        const validInput = {
            ciclista: { nome: 'Ana', cpf: '12345678901', email: 'ana@example.com', nascimento: '1990-01-01' },
            meioDePagamento: { numero: '4111111111111111', validade: '2026-12', cvv: '123' }
        };

        it('deve lançar erro se senhas não conferirem', async () => {
            await expect(
                ciclistaService.createCiclista({ ...validInput, senha: 'a', confSenha: 'b' })
            ).rejects.toThrow('Senhas não conferem');
        });

        it('deve lançar erro se dados incompletos', async () => {
            await expect(
                ciclistaService.createCiclista({ ciclista: { nome: '', cpf: '', email: '' }, meioDePagamento: {}, senha: 'x', confSenha: 'x' })
            ).rejects.toThrow('Dados de ciclista incompletos');
        });

        it('deve criar ciclista chamando o repositório', async () => {
            const mockResult = { id: '1', nome: 'Ana' };
            db.criarCiclista.mockResolvedValue(mockResult);

            const result = await ciclistaService.createCiclista({ ...validInput, senha: '123', confSenha: '123' });
            expect(db.criarCiclista).toHaveBeenCalledWith(validInput.ciclista, validInput.meioDePagamento);
            expect(result).toBe(mockResult);
        });
    });

    describe('getCiclistaById', () => {
        it('deve lançar erro se não encontrar', async () => {
            db.obterCiclista.mockResolvedValue(undefined);
            await expect(ciclistaService.getCiclistaById('999')).rejects.toThrow('Ciclista não encontrado');
        });

        it('deve retornar ciclista em sucesso', async () => {
            const mockC = { id: '1', nome: 'Joao' };
            db.obterCiclista.mockResolvedValue(mockC);
            const result = await ciclistaService.getCiclistaById('1');
            expect(result).toBe(mockC);
        });
    });

    describe('updateCiclista', () => {
        it('deve chamar o repositório e retornar resultado', async () => {
            const mockUpdated = { id: '1', nome: 'Maria' };
            db.atualizarCiclista.mockResolvedValue(mockUpdated);
            const result = await ciclistaService.updateCiclista('1'); // só ID
            expect(db.atualizarCiclista).toHaveBeenCalledWith('1');

        });
    });

    describe('removeCiclista', () => {
        it('deve chamar o repositório e retornar mensagem', async () => {
            const mockRem = { mensagem: 'ok' };
            db.deletarCiclista.mockResolvedValue(mockRem);
            const result = await ciclistaService.removeCiclista('1');
            expect(db.deletarCiclista).toHaveBeenCalledWith('1');
            expect(result).toBe(mockRem);
        });
    });

    describe('activateCiclista', () => {
        it('deve ativar ciclista', async () => {
            const mockA = { id: '1', ativado: true };
            db.ativarCiclista.mockResolvedValue(mockA);
            const result = await ciclistaService.activateCiclista('1');
            expect(db.ativarCiclista).toHaveBeenCalledWith('1');
            expect(result).toBe(mockA);
        });
    });

    describe('emailExists', () => {
        it('deve retornar true ou false', async () => {
            db.existeEmail.mockResolvedValue(true);
            const exists = await ciclistaService.emailExists('x@x.com');
            expect(db.existeEmail).toHaveBeenCalledWith('x@x.com');
            expect(exists).toBe(true);
        });
    });
});
