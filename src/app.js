/**
 * Configuración de la Aplicación Express
 */
const express = require('express');
const cors = require('cors');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ message: "TEST-API de BombaVa" });
});

module.exports = app;