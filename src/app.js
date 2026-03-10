/**
 * Configuración de la aplicación Express.
 * Utiliza fachadas de módulos y configuración para un cableado limpio.
 */
import cors from 'cors';
import express from 'express';
import YAML  from 'yamljs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { authRoutes } from './modules/auth/index.js';
import { matchRoutes } from './modules/game/index.js';
import { inventoryRoutes } from './modules/inventory/index.js';
import { errorHandler } from './shared/middlewares/index.js';
import { fileURLToPath } from 'url';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/matches', matchRoutes);


const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Servir la carpeta estatica para que los $ref funcionen
app.use('/docs', express.static(path.join(__dirname, '../docs')));
const swaggerOptions = {
  swaggerOptions: {
    url: '/docs/openapi/openapi.yaml',
  },
};
app.use('/openapi-docs', swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

app.use('/asyncapi-docs', express.static(path.join(__dirname, '../docs/asyncapi/output')));


app.get('/', (req, res) => {
    res.json({ message: "API BombaVa V1 - HOME" });
});

app.use(errorHandler);

export default app;