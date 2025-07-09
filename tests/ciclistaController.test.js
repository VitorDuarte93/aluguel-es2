// tests/cartaoController.test.js

const request = require('supertest');
const express = require('express');
const { beforeEach, describe, it, expect } = require('@jest/globals');

// Mock services
jest.mock('../services/ciclista');
jest.mock('../services/cartao');
const cartaoService = require('../services/cartao');
const ciclistaService = require('../services/ciclista');

// Controllers
const cartaoController = require('../controllers/cartaoController');
const ciclistaRouter = require('../controllers/ciclistaController');

function createAppWith(controller) {
    const app = express();
    app.use(express.json());
    app.use(controller);
    return app;
}

// ======================== CartãoController ========================
describe('CartãoController', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = createAppWith(cartaoController);
    });

    describe('GET /cartaoDeCredito/:idCiclista', () => {
        it('retorna 404 se idCiclista não for fornecido', async () => {
            const res = await request(app).get('/cartaoDeCredito/');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ erro: 'Requisição mal formada' });
        });

        it('retorna 200 e o cartão em caso de sucesso', async () => {
            const mockCartao = { id: '39044', numero: '4111111111111111' };
            cartaoService.recuperaCartao.mockResolvedValue(mockCartao);

            const res = await request(app).get('/cartaoDeCredito/30110');
            expect(cartaoService.recuperaCartao).toHaveBeenCalledWith('30110');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockCartao);
        });

        it('retorna 500 em erro interno', async () => {
            cartaoService.recuperaCartao.mockRejectedValue(new Error('erro'));
            const res = await request(app).get('/cartaoDeCredito/30110');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('PUT /cartaoDeCredito/:idCiclista', () => {
        it('retorna 404 se dados faltarem', async () => {
            const res1 = await request(app).put('/cartaoDeCredito/');
            expect(res1.status).toBe(404);
            expect(res1.body).toEqual({ erro: 'Requisição mal formada' });

            const res2 = await request(app).put('/cartaoDeCredito/30110').send();
            expect(res2.status).toBe(404);
            expect(res2.body).toEqual({ erro: 'Requisição mal formada' });
        });

        it('retorna 200 em sucesso', async () => {
            const update = { validade: '2027-04', cvv: '321' };
            const mock = { id: '39044', ...update };
            cartaoService.alterarCartao.mockResolvedValue(mock);

            const res = await request(app).put('/cartaoDeCredito/30110').send(update);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mock);
        });

        it('retorna 500 em erro interno', async () => {
            cartaoService.alterarCartao.mockRejectedValue(new Error('erro'));
            const res = await request(app).put('/cartaoDeCredito/30110').send({});
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });
});

// ======================== CiclistaController ========================
describe('CiclistaController', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = createAppWith(ciclistaRouter);
    });

    describe('POST /ciclista', () => {
        const valid = {
            ciclista: { nome: 'Joao', cpf: '123', email: 'joao@example.com' },
            meioDePagamento: { numero: '4111', validade: '2026-12', cvv: '123' },
            senha: 'abc', confSenha: 'abc'
        };

        it('404 se faltar campos', async () => {
            const res = await request(app).post('/ciclista').send({});
            expect(res.status).toBe(404);
        });

        it('422 se senhas diferentes', async () => {
            const res = await request(app).post('/ciclista').send({ ...valid, confSenha: 'errado' });
            expect(res.status).toBe(422);
        });

        it('422 se dados inválidos', async () => {
            const invalido = { ...valid, ciclista: { nome: '', cpf: '', email: '' } };
            const res = await request(app).post('/ciclista').send(invalido);
            expect(res.status).toBe(422);
        });

        it('201 se sucesso', async () => {
            const mock = { id: '1', nome: 'Joao' };
            ciclistaService.cadastrarCiclista.mockResolvedValue(mock);
            const res = await request(app).post('/ciclista').send(valid);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mock);
        });

        it('500 em erro interno', async () => {
            ciclistaService.cadastrarCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app).post('/ciclista').send(valid);
            expect(res.status).toBe(500);
        });
    });

    describe('PUT /ciclista/:id', () => {
        it('404 se body ou id ausente', async () => {
            const res1 = await request(app).put('/ciclista/');
            expect(res1.status).toBe(404);

            const res2 = await request(app).put('/ciclista/1').send({});
            expect(res2.status).toBe(404);
        });

        it('200 em sucesso', async () => {
            const mock = { id: '1', nome: 'Maria' };
            ciclistaService.alteraCiclista.mockResolvedValue(mock);
            const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Maria' } });
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mock);
        });

        it('500 em erro interno', async () => {
            ciclistaService.alteraCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Maria' } });
            expect(res.status).toBe(500);
        });
    });

    describe('GET /ciclista/:id', () => {
        it('404 se id ausente', async () => {
            const res = await request(app).get('/ciclista/');
            expect(res.status).toBe(404);
        });

        it('404 se não encontrado', async () => {
            ciclistaService.recuperaCiclista.mockResolvedValue(null);
            const res = await request(app).get('/ciclista/123');
            expect(res.status).toBe(404);
        });

        it('200 em sucesso', async () => {
            const mock = { id: '1', nome: 'Joao' };
            ciclistaService.recuperaCiclista.mockResolvedValue(mock);
            const res = await request(app).get('/ciclista/1');
            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /ciclista/:id', () => {
        it('404 se id ausente', async () => {
            const res = await request(app).delete('/ciclista/');
            expect(res.status).toBe(404);
        });

        it('200 em sucesso', async () => {
            ciclistaService.removeCiclista.mockResolvedValue({});
            const res = await request(app).delete('/ciclista/1');
            expect(res.status).toBe(200);
        });

        it('500 em erro interno', async () => {
            ciclistaService.removeCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app).delete('/ciclista/1');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /ciclista/:id/ativar', () => {
        it('404 se id ausente', async () => {
            const res = await request(app).post('/ciclista/');
            expect(res.status).toBe(404);
        });

        it('200 em sucesso', async () => {
            const mock = { id: '1', ativado: true };
            ciclistaService.ativarCiclista.mockResolvedValue(mock);
            const res = await request(app).post('/ciclista/1/ativar');
            expect(res.status).toBe(200);
        });

        it('500 em erro interno', async () => {
            ciclistaService.ativarCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app).post('/ciclista/1/ativar');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /ciclista/existeEmail/:email', () => {
        it('404 se email ausente', async () => {
            const res = await request(app).get('/ciclista/existeEmail/');
            expect(res.status).toBe(404);
        });

        it('200 se existe', async () => {
            ciclistaService.existeEmail.mockResolvedValue(true);
            const res = await request(app).get('/ciclista/existeEmail/test@example.com');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ existe: true });
        });

        it('500 se erro interno', async () => {
            ciclistaService.existeEmail.mockRejectedValue(new Error('fail'));
            const res = await request(app).get('/ciclista/existeEmail/test@example.com');
            expect(res.status).toBe(500);
        });
    });
});
