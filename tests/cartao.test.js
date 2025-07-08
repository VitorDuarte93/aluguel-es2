
const request = require('supertest');
const express = require('express');
const { beforeEach, describe, it, expect } = require('@jest/globals');

// Mock the cartao service
jest.mock('../services/cartao');
const cartaoService = require('../services/cartao');

// Import the controller/router
const cartaoController = require('../controllers/cartaoController');

// Setup express app for testing
function createApp() {
    const app = express();
    app.use(express.json());
    app.use(cartaoController);
    return app;
}

describe('CartãoController', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = createApp();
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

        it('retorna 500 se o serviço lançar erro', async () => {
            cartaoService.recuperaCartao.mockRejectedValue(new Error('DB failure'));

            const res = await request(app).get('/cartaoDeCredito/30110');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('PUT /cartaoDeCredito/:idCiclista', () => {
        it('retorna 404 se idCiclista ou body estiver faltando', async () => {
            const res1 = await request(app).put('/cartaoDeCredito/');
            expect(res1.status).toBe(404);
            expect(res1.body).toEqual({ erro: 'Requisição mal formada' });

            const res2 = await request(app)
                .put('/cartaoDeCredito/30110')
                .send(); // empty body
            expect(res2.status).toBe(404);
            expect(res2.body).toEqual({ erro: 'Requisição mal formada' });
        });

        it('retorna 200 e o cartão atualizado em caso de sucesso', async () => {
            const updateData = { validade: '2027-04', cvv: '321' };
            const mockAtualizado = { id: '39044', ...updateData };
            cartaoService.alterarCartao.mockResolvedValue(mockAtualizado);

            const res = await request(app)
                .put('/cartaoDeCredito/30110')
                .send(updateData);

            expect(cartaoService.alterarCartao).toHaveBeenCalledWith('30110', updateData);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockAtualizado);
        });

        it('retorna 500 se o serviço lançar erro', async () => {
            cartaoService.alterarCartao.mockRejectedValue(new Error('Update failure'));

            const res = await request(app)
                .put('/cartaoDeCredito/30110')
                .send({ numero: '4222222222222222' });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });
});
