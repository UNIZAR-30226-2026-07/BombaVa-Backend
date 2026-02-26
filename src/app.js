/**
 * Configuración de la aplicación Express.
 * Utiliza fachadas de módulos y configuración para un cableado limpio.
 */
import cors from 'cors';
import express from 'express';
import { authRoutes } from './modules/auth/index.js';
import { matchRoutes } from './modules/game/index.js';
import { inventoryRoutes } from './modules/inventory/index.js';
import { errorHandler } from './shared/middlewares/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/matches', matchRoutes);

app.get('/', (req, res) => {
    res.json({ message: "API BombaVa V1 - HOME" });
});

app.use(errorHandler);

export default app;