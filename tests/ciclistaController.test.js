const request = require('supertest');
const express = require('express');
const ciclistaRouter = require('../controllers/ciclistaController');

// Mock do service
jest.mock('../services/ciclista');
const ciclistaService = require('../services/ciclista');

let app;

beforeEach(() => {
  jest.clearAllMocks();
  app = express();
  app.use(express.json());
  app.use(ciclistaRouter);
});

describe('POST /ciclista', () => {
  const validBody = {
    ciclista: { nome: 'Ana', cpf: '12345678900', email: 'ana@example.com' },
    meioDePagamento: { numero: '4111111111111111', validade: '2027-05', cvv: '123' },
    senha: 'senha123',
    confSenha: 'senha123'
  };

  it('retorna 404 se faltar campos', async () => {
    const res = await request(app).post('/ciclista').send({});
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Requisição mal formada' });
  });

  it('retorna 422 se senhas forem diferentes', async () => {
    const res = await request(app)
      .post('/ciclista')
      .send({ ...validBody, confSenha: 'diferente' });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ erro: 'Senhas não conferem' });
  });

  it('retorna 422 se dados do ciclista forem inválidos', async () => {
    const res = await request(app)
      .post('/ciclista')
      .send({ ...validBody, ciclista: { nome: '', cpf: '', email: '' } });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ erro: 'Dados inválidos' });
  });

  it('retorna 201 em caso de sucesso', async () => {
    const mock = { id: '1', nome: 'Ana' };
    ciclistaService.cadastrarCiclista.mockResolvedValue(mock);
    const res = await request(app).post('/ciclista').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toEqual(mock);
  });

  it('retorna 500 em erro interno', async () => {
    ciclistaService.cadastrarCiclista.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/ciclista').send(validBody);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
  });
});

describe('PUT /ciclista/:id', () => {
  it('retorna 404 se faltar id ou dados', async () => {
    // Enviar para /ciclista sem id não casa com a rota PUT /ciclista/:id, então 404 do Express
    // Para disparar seu 404 interno, faça:
    const res = await request(app).put('/ciclista/').send({});
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Requisição mal formada' });

    // Também testar id presente, mas dados ausentes
    const res2 = await request(app).put('/ciclista/1').send({});
    expect(res2.status).toBe(404);
    expect(res2.body).toEqual({ erro: 'Requisição mal formada' });
  });

  it('retorna 200 em sucesso', async () => {
    const mock = { id: '1', nome: 'Ana Atualizada' };
    ciclistaService.alteraCiclista.mockResolvedValue(mock);
    const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Ana Atualizada' } });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mock);
  });

  it('retorna 500 em erro interno', async () => {
    ciclistaService.alteraCiclista.mockRejectedValue(new Error('fail'));
    const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Erro' } });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
  });
});

describe('GET /:id', () => {
  it('retorna 404 se id ausente (rota não encontrada)', async () => {
    // GET / chama outra rota, não existe rota GET / sem id, Express dá 404
    const res = await request(app).get('/');
    expect(res.status).toBe(404);
  });

  it('retorna 404 se não encontrar ciclista', async () => {
    ciclistaService.recuperaCiclista.mockResolvedValue(null);
    const res = await request(app).get('/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Ciclista não encontrado' });
  });

  it('retorna 200 se encontrar', async () => {
    const mock = { id: '1', nome: 'Carlos' };
    ciclistaService.recuperaCiclista.mockResolvedValue(mock);
    const res = await request(app).get('/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mock);
  });

  it('retorna 500 em erro interno', async () => {
    ciclistaService.recuperaCiclista.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/1');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
  });
});

describe('DELETE /:id', () => {
  it('retorna 404 se id for vazio (rota não encontrada)', async () => {
    const res = await request(app).delete('/');
    expect(res.status).toBe(404);
  });

  it('retorna 200 em sucesso', async () => {
    ciclistaService.removeCiclista.mockResolvedValue({ response: 'ok' });
    const res = await request(app).delete('/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('response');
  });

  it('retorna 500 em erro interno', async () => {
    ciclistaService.removeCiclista.mockRejectedValue(new Error('fail'));
    const res = await request(app).delete('/1');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
  });
});

describe('POST /:id/ativar', () => {
  it('retorna 404 se id for inválido', async () => {
    // Rota inválida - dupla barra, rota não existe no express
    const res = await request(app).post('//ativar');
    expect(res.status).toBe(404);
  });

  it('retorna 200 em sucesso', async () => {
    const mock = { id: '1', ativado: true };
    ciclistaService.ativarCiclista.mockResolvedValue(mock);
    const res = await request(app).post('/1/ativar');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mock);
  });

  it('retorna 500 em erro interno', async () => {
    ciclistaService.ativarCiclista.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/1/ativar');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
  });
});

describe('GET /existeEmail/:email', () => {
  it('retorna 404 se email não for fornecido', async () => {
    // No seu controller, se não passar email, retorna 404
    const res = await request(app).get('/existeEmail/');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Requisição mal formada' });
  });

  it('retorna 200 em sucesso', async () => {
    ciclistaService.existeEmail.mockResolvedValue(true);
    const res = await request(app).get('/existeEmail/ana@example.com');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ existe: true });
  });

  it('retorna 500 em erro interno', async () => {
    ciclistaService.existeEmail.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/existeEmail/ana@example.com');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
  });
});
