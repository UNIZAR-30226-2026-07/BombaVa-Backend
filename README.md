# BombaVa - Backend

Backend táctico para el juego BombaVa. Implementado con una arquitectura modular basada en fachadas y comunicación en tiempo real mediante WebSockets.

## Requisitos previos

- **Node.js** v20+
- **Docker** y **Docker Compose**
- **Archivo .env** (Crea uno en la raíz basado en las variables de `db.js`)

## Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Levantar infraestructura (Base de Datos):**
   ```bash
   npm run infra:up
   ```

3. **Arrancar servidor en desarrollo:**
   ```bash
   npm run dev
   ```

## Testing

El proyecto utiliza una arquitectura de **tests colocalizados**.
- `*.test.js`: Tests unitarios rápidos.
- `*.int.test.js`: Tests de integración con Base de Datos.

```bash
npm test          # Ejecuta toda la suite
npm run test:unit # Solo lógica pura
npm run test:int  # Integración (requiere DB activa)
```

## Comandos de Ayuda

| Comando | Descripción |
| :--- | :--- |
| `npm run infra:up` | Levanta Postgres y Adminer en segundo plano. |
| `npm run infra:down` | Apaga los contenedores de infraestructura. |
| `npm run infra:logs` | Ver logs de la base de datos en tiempo real. |

## Estructura del Proyecto

- `src/modules`: Lógica de negocio segmentada (Auth, Engine, Game, Inventory).
- `src/shared`: Componentes comunes (Middlewares, Sockets, Models).
- `.infrastructure`: Configuración de Docker y servicios externos.
- `src/config/gameRules.js`: Punto único de balanceo del juego (daños, costes, rangos).

