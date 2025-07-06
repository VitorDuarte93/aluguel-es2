const fs = require('fs');
const path = require('path');
let validacao = require('./validacao');
const dbPath = path.join(__dirname, '../ciclistas.json');
function generateId() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

async function cadastrarCiclista(ciclista, metodoPagamento) {
    if (!validacao.validarEmail(ciclista.email)) {
        throw new Error('E-mail inválido');
    }
    if (!validacao.validarCPF(ciclista.cpf)) {
        throw new Error('CPF inválido');
    }




    const ciclistaId = generateId();
    const novoCiclista = { id: ciclistaId, ativado: false, ...ciclista };


    //assumir que o pagamento é válido
    const pagamentoId = generateId();
    
    const novoPagamento = { id: pagamentoId, ciclistaId, ...metodoPagamento };

    let db;
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
    } catch (error) {
        throw new Error('Erro ao ler o banco de dados');
    }

    db.ciclistas = db.ciclistas || [];
    db.meiosPagamento = db.meiosPagamento || [];
    db.ciclistas.push(novoCiclista);
    db.meiosPagamento.push(novoPagamento);

    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('Erro ao salvar no banco de dados');
    }

    //Aqui, é pra enviar um email

    return novoCiclista;
}
async function alteraCiclista(ciclistaId, updateData) {
    let db;
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
    } catch (err) {
        throw new Error('Erro ao ler o banco de dados');
    }

    const idx = db.ciclistas.findIndex(c => c.id === ciclistaId);
    if (idx === -1) {
        throw new Error('Ciclista não encontrado');
    }

    const cic = db.ciclistas[idx];

    
    for (const [key, val] of Object.entries(updateData)) {
        if (val === undefined || val === null) continue;
        if (typeof val === 'string' && val.trim() === '') continue;

        
        if (typeof val === 'object' && !Array.isArray(val)) {
            cic[key] = cic[key] || {};
            for (const [subKey, subVal] of Object.entries(val)) {
                if (subVal === undefined || subVal === null) continue;
                if (typeof subVal === 'string' && subVal.trim() === '') continue;
                cic[key][subKey] = subVal;
            }
        } else {
            cic[key] = val;
        }
    }

    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
        //enviar um email aqui embaixo com sucesso

    } catch (err) {
        throw new Error('Erro ao salvar no banco de dados');
        //aqui, não sei se deveria enviar um email de fracasso ou só responder 500, provavelmente 500
    }

    return cic;
}

async function recuperaCiclista(id) {
    let db;
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
    } catch (err) {
        throw new Error('Erro ao ler o banco de dados');
    }

    const ciclista = db.ciclistas.find(c => c.id === id);
    if (!ciclista) {
        throw new Error('Ciclista não encontrado');
    }

    const metodoPagamento = db.meiosPagamento.find(m => m.ciclistaId === id) || null;

    return {
        ...ciclista,
        meioDePagamento: metodoPagamento
    };
}


async function removeCiclista(idCiclista) {
    let db;
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
    } catch (err) {
        throw new Error('Erro ao ler o banco de dados');
    }

    const idx = db.ciclistas.findIndex(c => c.id === idCiclista);
    if (idx === -1) {
        throw new Error('Ciclista não encontrado');
    }
    db.ciclistas.splice(idx, 1);

    // Remover meio de pagamento associado
    db.meiosPagamento = db.meiosPagamento.filter(mp => mp.ciclistaId !== idCiclista);

    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
        throw new Error('Erro ao salvar no banco de dados');
    }

    return { message: 'Ciclista e meios de pagamento removidos com sucesso' };
}

async function ativarCiclista(idCiclista) {
    let db;
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
    } catch (err) {
        throw new Error('Erro ao ler o banco de dados');
    }

    const idx = db.ciclistas.findIndex(c => c.id === idCiclista);
    if (idx === -1) {
        throw new Error('Ciclista não encontrado');
    }

    db.ciclistas[idx].ativado = true;

    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
        throw new Error('Erro ao salvar no banco de dados');
    }

    return db.ciclistas[idx];
}

async function existeEmail(email) {
    let db;
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
    } catch (err) {
        throw new Error('Erro ao ler o banco de dados');
    }

    for (const ciclista of db.ciclistas) {
        if (ciclista.email === email) {
            return true; //se tiver alguém com aquele email já registrado, é true
        }
    }
    return false;
}

module.exports = {
    cadastrarCiclista,
    alteraCiclista,
    recuperaCiclista,
    removeCiclista,
    ativarCiclista,
    existeEmail
}