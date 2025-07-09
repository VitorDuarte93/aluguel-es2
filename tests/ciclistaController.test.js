// tests/ciclistaController.test.js
const request = require('supertest');
const express = require('express');
const ciclistaRouter = require('../controllers/ciclistaController');
jest.mock('../services/ciclista');
const ciclistaService = require('../services/ciclista');

describe('CiclistaController', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use(ciclistaRouter);
    });

    describe('POST /ciclista', () => {
        const bodyValido = {
            ciclista: { nome: 'João', cpf: '123', email: 'joao@email.com' },
            meioDePagamento: { numero: '4111', validade: '2026-12', cvv: '123' },
            senha: '123',
            confSenha: '123'
        };

        it('retorna 404 se campos faltarem', async () => {
            const res = await request(app).post('/ciclista').send({});
            expect(res.status).toBe(404);
        });

        it('retorna 422 se senhas diferentes', async () => {
            const res = await request(app).post('/ciclista').send({ ...bodyValido, confSenha: '000' });
            expect(res.status).toBe(422);
        });

        it('retorna 422 se dados do ciclista forem inválidos', async () => {
            const res = await request(app).post('/ciclista').send({
                ...bodyValido,
                ciclista: { nome: '', cpf: '', email: '' }
            });
            expect(res.status).toBe(422);
        });

        it('retorna 201 em sucesso', async () => {
            const mockCiclista = { id: 1, nome: 'João' };
            ciclistaService.cadastrarCiclista.mockResolvedValue(mockCiclista);
            const res = await request(app).post('/ciclista').send(bodyValido);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockCiclista);
        });

        it('retorna 500 em erro interno', async () => {
            ciclistaService.cadastrarCiclista.mockRejectedValue(new Error('fail'));
            const res = await request(app).post('/ciclista').send(bodyValido);
            expect(res.status).toBe(500);
        });
    });

    describe('PUT /ciclista/:id', () => {
        it('retorna 404 se faltar body ou id', async () => {
            const res = await request(app).put('/ciclista/').send({});
            expect(res.status).toBe(404);
        });

        it('retorna 200 em sucesso', async () => {
            ciclistaService.alteraCiclista.mockResolvedValue({ nome: 'Novo' });
            const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Novo' } });
            expect(res.status).toBe(200);
            expect(res.body.nome).toBe('Novo');
        });

        it('retorna 500 em erro', async () => {
            ciclistaService.alteraCiclista.mockRejectedValue(new Error());
            const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Novo' } });
            expect(res.status).toBe(500);
        });
    });

    describe('GET /ciclista/:id', () => {
        it('retorna 404 se id não for fornecido', async () => {
            const res = await request(app).get('/ciclista/');
            expect(res.status).toBe(404);
        });

        it('retorna 404 se não encontrar ciclista', async () => {
            ciclistaService.recuperaCiclista.mockResolvedValue(null);
            const res = await request(app).get('/ciclista/999');
            expect(res.status).toBe(404);
        });

        it('retorna 200 se encontrar', async () => {
            ciclistaService.recuperaCiclista.mockResolvedValue({ id: 1, nome: 'João' });
            const res = await request(app).get('/ciclista/1');
            expect(res.status).toBe(200);
        });

        it('retorna 500 em erro', async () => {
            ciclistaService.recuperaCiclista.mockRejectedValue(new Error());
            const res = await request(app).get('/ciclista/1');
            expect(res.status).toBe(500);
        });
    });

    describe('DELETE /ciclista/:id', () => {
        it('retorna 404 se não tiver id', async () => {
            const res = await request(app).delete('/ciclista/');
            expect(res.status).toBe(404);
        });

        it('retorna 200 em sucesso', async () => {
            ciclistaService.removeCiclista.mockResolvedValue({ apagado: true });
            const res = await request(app).delete('/ciclista/1');
            expect(res.status).toBe(200);
        });

        it('retorna 500 em erro', async () => {
            ciclistaService.removeCiclista.mockRejectedValue(new Error());
            const res = await request(app).delete('/ciclista/1');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /ciclista/:id/ativar', () => {
        it('retorna 404 se faltar id', async () => {
            const res = await request(app).post('/ciclista//ativar');
            expect(res.status).toBe(404);
        });

        it('retorna 200 se sucesso', async () => {
            ciclistaService.ativarCiclista.mockResolvedValue({ id: 1, status: 'ativo' });
            const res = await request(app).post('/ciclista/1/ativar');
            expect(res.status).toBe(200);
        });

        it('retorna 500 em erro', async () => {
            ciclistaService.ativarCiclista.mockRejectedValue(new Error());
            const res = await request(app).post('/ciclista/1/ativar');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /ciclista/existeEmail/:email', () => {
        it('retorna 404 se faltar email', async () => {
            const res = await request(app).get('/ciclista/existeEmail/');
            expect(res.status).toBe(404);
        });

        it('retorna 200 se email existir', async () => {
            ciclistaService.existeEmail.mockResolvedValue(true);
            const res = await request(app).get('/ciclista/existeEmail/test@email.com');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ existe: true });
        });

        it('retorna 500 se erro no serviço', async () => {
            ciclistaService.existeEmail.mockRejectedValue(new Error());
            const res = await request(app).get('/ciclista/existeEmail/test@email.com');
            expect(res.status).toBe(500);
        });
    });
});
