/**
 * Configuración de la Aplicación Express
 */
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes/authRoutes.js';

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

//Rutas
app.use('/api/auth', authRoutes);



// ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ message: "TEST-API de BombaVa" });
});

export default app;