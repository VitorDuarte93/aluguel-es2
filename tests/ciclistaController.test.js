const request = require('supertest');
const express = require('express');
const { beforeEach, describe, it, expect } = require('@jest/globals');

// Mock do service
jest.mock('../services/ciclista');
const ciclistaService = require('../services/ciclista');

// Controller
const ciclistaRouter = require('../controllers/ciclistaController');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(ciclistaRouter);
  return app;
};

describe('CiclistaController', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  describe('POST /ciclista', () => {
    const validBody = {
      ciclista: { nome: 'João', cpf: '12345678900', email: 'joao@email.com' },
      meioDePagamento: { numero: '4111111111111111', validade: '2026-12', cvv: '123' },
      senha: 'abc123',
      confSenha: 'abc123'
    };

    it('retorna 404 se faltar dados', async () => {
      const res = await request(app).post('/ciclista').send({});
      expect(res.status).toBe(404);
    });

    it('retorna 422 se senhas diferentes', async () => {
      const res = await request(app).post('/ciclista').send({ ...validBody, confSenha: 'diferente' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 se dados do ciclista inválidos', async () => {
      const res = await request(app).post('/ciclista').send({ ...validBody, ciclista: { nome: '', cpf: '', email: '' } });
      expect(res.status).toBe(422);
    });

    it('retorna 201 se sucesso', async () => {
      const mockResult = { id: '1', nome: 'João' };
      ciclistaService.cadastrarCiclista.mockResolvedValue(mockResult);
      const res = await request(app).post('/ciclista').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockResult);
    });

    it('retorna 500 se erro interno', async () => {
      ciclistaService.cadastrarCiclista.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/ciclista').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /ciclista/:id', () => {
    it('retorna 404 se faltar dados', async () => {
      const res = await request(app).put('/ciclista/').send({});
      expect(res.status).toBe(404);
    });

    it('retorna 200 se sucesso', async () => {
      const mockResult = { id: '1', nome: 'Maria' };
      ciclistaService.alteraCiclista.mockResolvedValue(mockResult);
      const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Maria' } });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });

    it('retorna 500 se erro interno', async () => {
      ciclistaService.alteraCiclista.mockRejectedValue(new Error('fail'));
      const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Maria' } });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /ciclista/:id', () => {
    it('retorna 404 se não tiver ID', async () => {
      const res = await request(app).get('/ciclista/');
      expect(res.status).toBe(404);
    });

    it('retorna 404 se ciclista não encontrado', async () => {
      ciclistaService.recuperaCiclista.mockResolvedValue(null);
      const res = await request(app).get('/ciclista/1');
      expect(res.status).toBe(404);
    });

    it('retorna 200 se sucesso', async () => {
      const mockCiclista = { id: '1', nome: 'João' };
      ciclistaService.recuperaCiclista.mockResolvedValue(mockCiclista);
      const res = await request(app).get('/ciclista/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCiclista);
    });

    it('retorna 500 se erro interno', async () => {
      ciclistaService.recuperaCiclista.mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/ciclista/1');
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /ciclista/:id', () => {
    it('retorna 404 se faltar ID', async () => {
      const res = await request(app).delete('/ciclista/');
      expect(res.status).toBe(404);
    });

    it('retorna 200 se sucesso', async () => {
      ciclistaService.removeCiclista.mockResolvedValue({});
      const res = await request(app).delete('/ciclista/1');
      expect(res.status).toBe(200);
    });

    it('retorna 500 se erro interno', async () => {
      ciclistaService.removeCiclista.mockRejectedValue(new Error('fail'));
      const res = await request(app).delete('/ciclista/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /ciclista/:id/ativar', () => {
    it('retorna 404 se faltar ID', async () => {
      const res = await request(app).post('/ciclista//ativar');
      expect(res.status).toBe(404);
    });

    it('retorna 200 se sucesso', async () => {
      const mockC = { id: '1', ativado: true };
      ciclistaService.ativarCiclista.mockResolvedValue(mockC);
      const res = await request(app).post('/ciclista/1/ativar');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockC);
    });

    it('retorna 500 se erro interno', async () => {
      ciclistaService.ativarCiclista.mockRejectedValue(new Error('fail'));
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

    it('retorna 500 se erro interno', async () => {
      ciclistaService.existeEmail.mockRejectedValue(new Error('erro'));
      const res = await request(app).get('/ciclista/existeEmail/test@email.com');
      expect(res.status).toBe(500);
    });
  });
});
