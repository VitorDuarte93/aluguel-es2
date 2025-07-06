const fs = require('fs');
const path = require('path');
const validacao = require('../services/validacao');
const {
    cadastrarCiclista,
    alteraCiclista,
    recuperaCiclista,
    removeCiclista,
    ativarCiclista,
    existeEmail
} = require('../services/ciclista');

const mockData = require('./__mocks__/database.json');
const { beforeEach, describe, it, expect} = require('@jest/globals');

// Mocks
jest.mock('fs');
jest.mock('../metodos/validacao');

let mockDb;

beforeEach(() => {

    // Clona mockData a cada teste
    mockDb = JSON.parse(JSON.stringify(mockData));


    // Mocka leitura e escrita do arquivo
    fs.readFileSync.mockImplementation(() => JSON.stringify(mockDb));
    fs.writeFileSync.mockImplementation((path, data) => {
        mockDb = JSON.parse(data);
    });

    // Mocka as validações como verdadeiras por padrão
    validacao.validarEmail.mockReturnValue(true);
    validacao.validarCPF.mockReturnValue(true);
});

describe('cadastrarCiclista', () => {
    it('deve cadastrar um ciclista e meio de pagamento', async () => {
        const ciclista = {
            nome: 'João',
            email: 'joao@email.com',
            cpf: '12345678900'
        };
        const metodoPagamento = {
            numero_cartao: '1234123412341234',
            nome_no_cartao: 'João',
            validade: '12/26',
            codigo_seg: '123'
        };

        const novo = await cadastrarCiclista(ciclista, metodoPagamento);

        expect(novo).toHaveProperty('id');
        expect(mockDb.ciclistas.length).toBeGreaterThan(0);
        expect(mockDb.meiosPagamento.length).toBeGreaterThan(0);
        expect(mockDb.ciclistas.at(-1).ativado).toBe(false);
    });

    it('deve lançar erro se o e-mail for inválido', async () => {
        validacao.validarEmail.mockReturnValue(false);

        await expect(
            cadastrarCiclista({ email: 'invalido', cpf: '123' }, {})
        ).rejects.toThrow('E-mail inválido');
    });

    it('deve lançar erro se o CPF for inválido', async () => {
        validacao.validarCPF.mockReturnValue(false);

        await expect(
            cadastrarCiclista({ email: 'a@a.com', cpf: 'invalido' }, {})
        ).rejects.toThrow('CPF inválido');
    });
});

describe('alteraCiclista', () => {
    it('deve atualizar os dados do ciclista', async () => {
        const cic = {
            id: '12345',
            nome: 'Maria',
            email: 'maria@ex.com',
            cpf: '11122233344',
            ativado: false
        };
        mockDb.ciclistas.push(cic);

        const alterado = await alteraCiclista('12345', { nome: 'Maria Silva' });

        expect(alterado.nome).toBe('Maria Silva');
    });

    it('deve lançar erro se o ciclista não for encontrado', async () => {
        await expect(
            alteraCiclista('99999', { nome: 'Qualquer' })
        ).rejects.toThrow('Ciclista não encontrado');
    });
});

describe('recuperaCiclista', () => {
    it('deve recuperar ciclista com método de pagamento', async () => {
        const cic = {
            id: '999',
            nome: 'Teste',
            email: 't@t.com',
            cpf: '00000000000',
            ativado: true
        };
        const pagamento = {
            id: '123',
            ciclistaId: '999',
            numero_cartao: '1234'
        };
        mockDb.ciclistas.push(cic);
        mockDb.meiosPagamento.push(pagamento);

        const res = await recuperaCiclista('999');

        expect(res.nome).toBe('Teste');
        expect(res.meioDePagamento.numero_cartao).toBe('1234');
    });

    it('deve lançar erro se ciclista não existir', async () => {
        await expect(recuperaCiclista('semId')).rejects.toThrow('Ciclista não encontrado');
    });
});

describe('removeCiclista', () => {
    it('deve remover ciclista e seus meios de pagamento', async () => {
        mockDb.ciclistas.push({ id: '1010', nome: 'X' });
        mockDb.meiosPagamento.push({ id: '1', ciclistaId: '1010' });

        const res = await removeCiclista('1010');

        expect(mockDb.ciclistas.some(c => c.id === '1010')).toBe(false);
        expect(mockDb.meiosPagamento.some(m => m.ciclistaId === '1010')).toBe(false);
        expect(res.message).toMatch(/removidos com sucesso/);
    });

    it('deve lançar erro se ciclista não existir', async () => {
        await expect(removeCiclista('naoExiste')).rejects.toThrow('Ciclista não encontrado');
    });
});

describe('ativarCiclista', () => {
    it('deve ativar ciclista corretamente', async () => {
        mockDb.ciclistas.push({ id: '444', ativado: false });

        const res = await ativarCiclista('444');

        expect(res.ativado).toBe(true);
    });

    it('deve lançar erro se ciclista não existir', async () => {
        await expect(ativarCiclista('semId')).rejects.toThrow('Ciclista não encontrado');
    });
});

describe('existeEmail', () => {
    it('deve retornar true se o e-mail existir', async () => {
        mockDb.ciclistas.push({ id: '1', email: 'existente@x.com' });

        const res = await existeEmail('existente@x.com');
        expect(res).toBe(true);
    });

    it('deve retornar false se o e-mail não existir', async () => {
        const res = await existeEmail('naoexiste@x.com');
        expect(res).toBe(false);
    });
});


