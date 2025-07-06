const database = require('../repositories/aluguelDB')
async function alugarBicicleta(idCiclista, idTranca) {
    let bicicleta = await database.recuperaBicicletaPorTranca(idTranca);

    if (bicicleta.status === "disponível"){
        //ciclista já possui um aluguel ativo?
        let aluguelAtivo = await database.verificaAluguelAtivo(idCiclista);
        if (!aluguelAtivo){
            //pega a data de início, pega a tranca, cria e paga a cobrança (externos), libera a bicicleta
            let dataInicio = new Date().toISOString();
            //aqui a gente chamaria o externos -> cobrança.
            await database.registraAluguel(idCiclista, bicicleta.id, dataInicio);

        } else {
            //tem aluguel ativo
            throw new Error ('Já possui um aluguel ativo. Finalizar o aluguel atual antes de alugar uma nova bicicleta.');
        }

    } else {
        // bota que não tá disponível
        throw new Error('Bicicleta não disponível para aluguel');
    }

}

async function devolverBicicleta(trancaFim, idBicicleta) {
    // 1. Verifica se o ciclista tem um aluguel ativo
    let aluguelAtivo = await database.verificaCiclistaComBicicleta(idBicicleta);
    if (!aluguelAtivo) {
        throw new Error('Nenhum aluguel ativo encontrado para essa bicicleta');
    }

    // 2. Atualiza o horário de fim do aluguel
    let dataFim = new Date().toISOString();
    await database.finalizarAluguel(aluguelAtivo, trancaFim, dataFim);

    // 3. Atualiza o status da bicicleta para "disponível"
    await database.atualizarStatusBicicleta(idBicicleta, 'disponível');

    //equipamentos -> tranca -> trancar

    return { mensagem: 'Bicicleta devolvida com sucesso' };
}

module.exports = {
    alugarBicicleta,
    devolverBicicleta
}