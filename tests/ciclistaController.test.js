const request = require('supertest');
const express = require('express');
const { beforeEach, describe, it, expect } = require('@jest/globals');

jest.mock('../services/ciclista');
const ciclistaService = require('../services/ciclista');

const ciclistaRouter = require('../controllers/ciclistaController');
const app = express();
app.use(express.json());
app.use(ciclistaRouter);

beforeEach(() => jest.clearAllMocks());

describe('CiclistaController', () => {
    describe('POST /ciclista', () => {
        const validBody = {
            ciclista: { nome: 'Joao', cpf: '123', email: 'joao@example.com' },
            meioDePagamento: { numero: '4111', validade: '2026-12', cvv: '123' },
            senha: 'abc',
            confSenha: 'abc'
        };

        it('retorna 404 se faltar campos obrigatórios', async () => {
            const res = await request(app).post('/ciclista').send({});
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ erro: 'Requisição mal formada' });
        });

        it('retorna 422 se senhas não conferirem', async () => {
            const res = await request(app)
                .post('/ciclista')
                .send({ ...validBody, confSenha: 'wrong' });
            expect(res.status).toBe(422);
            expect(res.body).toEqual({ erro: 'Senhas não conferem' });
        });

        it('retorna 422 se dados de ciclista inválidos', async () => {
            const body = { ...validBody, ciclista: { nome: '', cpf: '', email: '' } };
            const res = await request(app).post('/ciclista').send(body);
            expect(res.status).toBe(422);
            expect(res.body).toEqual({ erro: 'Dados inválidos' });
        });

        it('retorna 201 em caso de sucesso', async () => {
            const mockResult = { id: '1', nome: 'Joao' };
            ciclistaService.cadastrarCiclista.mockResolvedValue(mockResult);
            const res = await request(app).post('/ciclista').send(validBody);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockResult);
            expect(ciclistaService.cadastrarCiclista)
                .toHaveBeenCalledWith(validBody.ciclista, validBody.meioDePagamento);
        });

        it('retorna 500 em erro interno', async () => {
            ciclistaService.cadastrarCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app).post('/ciclista').send(validBody);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('PUT /ciclista/:id', () => {
        it('retorna 404 se faltar body ou id', async () => {
            const res = await request(app).put('/ciclista/').send({});
            expect(res.status).toBe(404);
        });

        it('retorna 200 em sucesso', async () => {
            const mockResult = { id: '1', nome: 'Maria' };
            ciclistaService.alteraCiclista.mockResolvedValue(mockResult);
            const res = await request(app)
                .put('/ciclista/1')
                .send({ dadosCiclista: { nome: 'Maria' } });
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockResult);
        });

        it('retorna 500 em erro interno', async () => {
            ciclistaService.alteraCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app)
                .put('/ciclista/1')
                .send({ dadosCiclista: { nome: 'Maria' } });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('GET /:id', () => {
        it('retorna 404 se id faltar', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(404);
        });

        it('retorna 404 se não encontrar', async () => {
            ciclistaService.recuperaCiclista.mockResolvedValue(null);
            const res = await request(app).get('/1');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ erro: 'Ciclista não encontrado' });
        });

        it('retorna 200 em sucesso', async () => {
            const mockC = { id: '1', nome: 'Joao' };
            ciclistaService.recuperaCiclista.mockResolvedValue(mockC);
            const res = await request(app).get('/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockC);
        });

        // **Novo teste para erro interno (catch)**
        it('retorna 500 em erro interno', async () => {
            ciclistaService.recuperaCiclista.mockRejectedValue(new Error('erro inesperado'));
            const res = await request(app).get('/123');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('DELETE /:id', () => {
        it('retorna 404 se faltar id', async () => {
            const res = await request(app).delete('/');
            expect(res.status).toBe(404);
        });

        it('retorna 200 em sucesso', async () => {
            ciclistaService.removeCiclista.mockResolvedValue({});
            const res = await request(app).delete('/1');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('response');
        });

        // **Novo teste para erro interno (catch)**
        it('retorna 500 em erro interno', async () => {
            ciclistaService.removeCiclista.mockRejectedValue(new Error('erro deletar'));
            const res = await request(app).delete('/123');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('POST /:id/ativar', () => {
        it('retorna 404 se faltar id', async () => {
            const res = await request(app).post('//ativar');
            expect(res.status).toBe(404);
        });

        it('retorna 200 em sucesso', async () => {
            const mockA = { id: '1', ativado: true };
            ciclistaService.ativarCiclista.mockResolvedValue(mockA);
            const res = await request(app).post('/1/ativar');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockA);
        });

        // **Novo teste para erro interno (catch)**
        it('retorna 500 em erro interno', async () => {
            ciclistaService.ativarCiclista.mockRejectedValue(new Error('erro ativar'));
            const res = await request(app).post('/123/ativar');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });

    describe('GET /existeEmail/:email', () => {
        it('retorna 404 se faltar email', async () => {
            const res = await request(app).get('/existeEmail/');
            expect(res.status).toBe(404);
        });

        it('retorna 200 com objeto existe', async () => {
            ciclistaService.existeEmail.mockResolvedValue(true);
            const res = await request(app).get('/existeEmail/test@example.com');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ existe: true });
        });

        // **Novo teste para erro interno (catch)**
        it('retorna 500 em erro interno', async () => {
            ciclistaService.existeEmail.mockRejectedValue(new Error('erro existeEmail'));
            const res = await request(app).get('/existeEmail/test@example.com');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
        });
    });
});
