const request = require('supertest');
const express = require('express');
const funcionarioRouter = require('../controllers/funcionarioController');
const funcionarioServices = require('../services/funcionario');

jest.mock('../services/funcionario');

const app = express();
app.use(express.json());
app.use(funcionarioRouter);

describe('POST /funcionario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um funcionário com sucesso', async () => {
    funcionarioServices.criaFuncionario.mockResolvedValue({ id: '1', nome: 'João' });

    const res = await request(app)
      .post('/funcionario')
      .send({ nome: 'João', email: 'joao@email.com' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: '1', nome: 'João' });
    expect(funcionarioServices.criaFuncionario).toHaveBeenCalledWith({ nome: 'João', email: 'joao@email.com' });
  });

  it('deve retornar erro 400 para requisição mal formada', async () => {
    const res = await request(app).post('/funcionario').send({ cargo: 'Gerente' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Requisição mal formada');
  });
});

describe('PUT /funcionario/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar um funcionário com sucesso', async () => {
    funcionarioServices.atualizaFuncionario.mockResolvedValue({ id: '1', nome: 'João Atualizado' });

    const res = await request(app)
      .put('/funcionario/1')
      .send({ nome: 'João Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', nome: 'João Atualizado' });
    expect(funcionarioServices.atualizaFuncionario).toHaveBeenCalledWith('1', { nome: 'João Atualizado' });
  });

  it('deve retornar erro 500 se der erro ao atualizar', async () => {
    funcionarioServices.atualizaFuncionario.mockImplementation(() => {
      throw new Error('Erro de teste');
    });

    const res = await request(app)
      .put('/funcionario/1')
      .send({ nome: 'Falha' });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain('Erro interno do servidor');
  });
});
