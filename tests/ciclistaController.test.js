jest.mock('../services/ciclista');
const ciclistaService = require('../services/ciclista');

describe('CiclistaController', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(require('../controllers/ciclistaController'));
  });

  describe('POST /ciclista', () => {
    const validBody = {
      ciclista: { nome: 'Joao', cpf: '123', email: 'joao@example.com' },
      meioDePagamento: { numero: '4111', validade: '2026-12', cvv: '123' },
      senha: 'abc',
      confSenha: 'abc'
    };

    it('retorna 404 se faltar campos', async () => {
      const res = await request(app).post('/ciclista').send({});
      expect(res.status).toBe(404);
    });

    it('retorna 422 se senhas diferentes', async () => {
      const res = await request(app).post('/ciclista').send({ ...validBody, confSenha: 'diferente' });
      expect(res.status).toBe(422);
    });

    it('retorna 422 se dados do ciclista incompletos', async () => {
      const body = { ...validBody, ciclista: { nome: '', cpf: '', email: '' } };
      const res = await request(app).post('/ciclista').send(body);
      expect(res.status).toBe(422);
    });

    it('retorna 201 em sucesso', async () => {
      const mock = { id: 1, nome: 'Joao' };
      ciclistaService.createCiclista.mockResolvedValue(mock);  // ajustado aqui
      const res = await request(app).post('/ciclista').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mock);
    });

    it('retorna 500 em erro interno', async () => {
      ciclistaService.createCiclista.mockRejectedValue(new Error('erro'));  // ajustado aqui
      const res = await request(app).post('/ciclista').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /ciclista/:id', () => {
    it('retorna 404 se faltar dados', async () => {
      const res = await request(app).put('/ciclista/1').send({});
      expect(res.status).toBe(404);
    });

    it('retorna 200 em sucesso', async () => {
      const mock = { id: 1, nome: 'Maria' };
      ciclistaService.updateCiclista.mockResolvedValue(mock);  // ajustado
      const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Maria' } });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mock);
    });

    it('retorna 500 em erro', async () => {
      ciclistaService.updateCiclista.mockRejectedValue(new Error('erro'));  // ajustado
      const res = await request(app).put('/ciclista/1').send({ dadosCiclista: { nome: 'Maria' } });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /ciclista/:id', () => {
    it('retorna 404 se não encontrar', async () => {
      ciclistaService.getCiclistaById.mockResolvedValue(null);  // ajustado
      const res = await request(app).get('/ciclista/1');
      expect(res.status).toBe(404);
    });

    it('retorna 200 se encontrar', async () => {
      const mock = { id: 1, nome: 'Joao' };
      ciclistaService.getCiclistaById.mockResolvedValue(mock);  // ajustado
      const res = await request(app).get('/ciclista/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mock);
    });

    it('retorna 500 em erro', async () => {
      ciclistaService.getCiclistaById.mockRejectedValue(new Error('erro'));  // ajustado
      const res = await request(app).get('/ciclista/1');
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /ciclista/:id', () => {
    it('retorna 200 em sucesso', async () => {
      ciclistaService.removeCiclista.mockResolvedValue({});  // ok
      const res = await request(app).delete('/ciclista/1');
      expect(res.status).toBe(200);
    });

    it('retorna 500 em erro', async () => {
      ciclistaService.removeCiclista.mockRejectedValue(new Error('erro'));
      const res = await request(app).delete('/ciclista/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /ciclista/:id/ativar', () => {
    it('retorna 200 em sucesso', async () => {
      const mock = { id: 1, ativado: true };
      ciclistaService.activateCiclista.mockResolvedValue(mock);  // ajustado
      const res = await request(app).post('/ciclista/1/ativar');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mock);
    });

    it('retorna 500 em erro', async () => {
      ciclistaService.activateCiclista.mockRejectedValue(new Error('erro'));  // ajustado
      const res = await request(app).post('/ciclista/1/ativar');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /ciclista/existeEmail/:email', () => {
    it('retorna 200 em sucesso', async () => {
      ciclistaService.emailExists.mockResolvedValue(true);  // ajustado
      const res = await request(app).get('/ciclista/existeEmail/test@example.com');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ existe: true });
    });

    it('retorna 500 em erro', async () => {
      ciclistaService.emailExists.mockRejectedValue(new Error('erro'));  // ajustado
      const res = await request(app).get('/ciclista/existeEmail/test@example.com');
      expect(res.status).toBe(500);
    });
  });
});
