const request = require('supertest');
const express = require('express');
const funcionarioRouter = require('../controllers/funcionarioController');
const funcionarioServices = require('../services/funcionario');
const { beforeEach, describe, it, expect } = require('@jest/globals');

jest.mock('../services/funcionario');

const app = express();
app.use(express.json());
app.use(funcionarioRouter);

describe('POST /funcionarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um funcionário com sucesso', async () => {
        funcionarioServices.criarFuncionario.mockResolvedValue({ id: '1', nome: 'João' });

        const res = await request(app)
            .post('/funcionarios')
            .send({ nome: 'João', cargo: 'Gerente' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: '1', nome: 'João' });
        expect(funcionarioServices.criarFuncionario).toHaveBeenCalledWith({ nome: 'João', cargo: 'Gerente' });
    });

    it('deve retornar erro 400 para requisição mal formada', async () => {
        const res = await request(app).post('/funcionarios').send({ cargo: 'Gerente' });

        expect(res.status).toBe(400);
        expect(res.body.erro).toBe('Nome é obrigatório');
    });
});

describe('PUT /funcionarios/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar um funcionário com sucesso', async () => {
        funcionarioServices.atualizarFuncionario.mockResolvedValue({ id: '1', nome: 'João Atualizado' });

        const res = await request(app)
            .put('/funcionarios/1')
            .send({ nome: 'João Atualizado' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: '1', nome: 'João Atualizado' });
        expect(funcionarioServices.atualizarFuncionario).toHaveBeenCalledWith('1', { nome: 'João Atualizado' });
    });

    it('deve retornar erro 404 se o funcionário não for encontrado', async () => {
        funcionarioServices.atualizarFuncionario.mockResolvedValue(null);

        const res = await request(app)
            .put('/funcionarios/999')
            .send({ nome: 'Inexistente' });

        expect(res.status).toBe(404);
        expect(res.body.erro).toBe('Funcionário não encontrado');
    });
});