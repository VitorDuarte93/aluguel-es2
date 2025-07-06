// aqui fica o server.js

const express = require('express');
const cors = require('cors');
const ciclistaRoutes = require('../controllers/ciclistaController');
const aluguelRoutes = require('../controllers/aluguelController');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/ciclista', ciclistaRoutes);

app.use('/aluguel', aluguelRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

module.exports = app;
