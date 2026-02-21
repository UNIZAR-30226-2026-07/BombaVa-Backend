/**
 * Express Application Configuration
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

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/matches', matchRoutes);

app.get('/', (req, res) => {
    res.json({ message: "TEST-API de BombaVa" });
});

app.use(errorHandler);

export default app;