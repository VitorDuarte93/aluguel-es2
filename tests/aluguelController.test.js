const request = require('supertest');
const express = require('express');
const aluguelRouter = require('../controllers/aluguelController');
const aluguelServices = require('../services/aluguel');
const { beforeEach, describe, it, expect} = require('@jest/globals');

jest.mock('../services/aluguel');

const app = express();
app.use(express.json());
app.use(aluguelRouter);

describe('POST /aluguel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve alugar uma bicicleta com sucesso', async () => {
        aluguelServices.alugarBicicleta.mockResolvedValue({ mensagem: 'Aluguel realizado com sucesso' });

        const res = await request(app)
            .post('/aluguel')
            .send({ idCiclista: '1', idTranca: '2' });

        expect(res.status).toBe(201);
        expect(res.body.mensagem).toBe('Aluguel realizado com sucesso');
        expect(aluguelServices.alugarBicicleta).toHaveBeenCalledWith('1', '2');
    });

    it('deve retornar erro 404 para requisição mal formada', async () => {
        const res = await request(app).post('/aluguel').send({ idCiclista: '1' });

        expect(res.status).toBe(404);
        expect(res.body.erro).toBe('Requisição mal formada');
    });
});

describe('POST /devolucao', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve devolver uma bicicleta com sucesso', async () => {
        aluguelServices.devolverBicicleta.mockResolvedValue({ mensagem: 'Bicicleta devolvida com sucesso' });

        const res = await request(app)
            .post('/devolucao')
            .send({ idTranca: '1', idBicicleta: '2' });

        expect(res.status).toBe(200);
        expect(res.body.mensagem).toBe('Bicicleta devolvida com sucesso');
        expect(aluguelServices.devolverBicicleta).toHaveBeenCalledWith('1', '2');
    });

    it('deve retornar erro 404 para requisição mal formada', async () => {
        const res = await request(app).post('/devolucao').send({ idTranca: '1' });

        expect(res.status).toBe(404);
        expect(res.body.erro).toBe('Requisição mal formada');
    });
});