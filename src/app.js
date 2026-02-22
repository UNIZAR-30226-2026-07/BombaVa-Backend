/**
 * Configuración de la aplicación Express.
 * Define los endpoints REST para gestión de cuenta e inventario.
 */
import cors from 'cors';
import express from 'express';
import authRoutes from './modules/auth/routes/authRoutes.js';
import matchRoutes from './modules/game/routes/matchRoutes.js';
import inventoryRoutes from './modules/inventory/routes/inventoryRoutes.js';
import { errorHandler } from './shared/middlewares/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Módulos REST (Fuera del tablero)
 */
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

/**
 * El módulo de partidas solo conserva endpoints de consulta como el historial.
 * Las acciones síncronas de juego han sido migradas a Sockets.
 */
app.use('/api/matches', matchRoutes);

app.get('/', (req, res) => {
    res.json({ message: "API BombaVa V1 - Sockets Activos para Gameplay" });
});

app.use(errorHandler);

export default app;