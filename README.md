# BombaVa - Táctico Naval (Backend)

Soporte lógico y motor de juego para el ecosistema BombaVa. Implementado con una arquitectura de Monolito Modular, comunicación híbrida (REST + WebSockets) y persistencia en PostgreSQL.

## Requisitos Previos

- **Entorno de Contenedores**: Docker o Podman (con `docker-compose` instalado).
- **Node.js**: v20+ (Solo si deseas ejecutar tests o desarrollo fuera de contenedores).
- **Herramienta de Construcción**: `npm` instalado en el sistema.

## Flujo de Trabajo 

Con el comando `npm run <opcion>` puedes ejecutar las siguientes acciones

| Comando | Acción |
| :--- | :--- |
| `npm run` | Muestra la lista de comandos disponibles. |
| `npm run dev` | Arranca el servidor en modo desarrollo con nodemon, permitiendo el hot realoading cuando se cambia cualquier fichero. |
| `make run start` | Arranca el servidor en modo normal. |
| `npm run infra:up` | Levanta la base de datos PostgreSQL en segundo plano. |
| `npm run infra:down` | Detiene la base de datos y limpia los volúmenes. |
| `npm run infra:logs` | Muestra los logs de los contenedores de Docker. |
| `npm run test` | Ejecuta la suite de pruebas contra la base de datos de Docker. |
| `npm run doc:async` | Compila la documentación de asyncApi. Mas información [aquí](#generar-documentación-de-sockets). |

## Estrategia de Testing

El proyecto utiliza **Tests Colocalizados** para mantener la documentación técnica cerca de la implementación.

1. **Tests Unitarios (`*.test.js`)**: Validan lógica pura, cálculos del motor y servicios sin dependencias externas.
2. **Tests de Integración (`*.int.test.js`)**: Validan la persistencia real en PostgreSQL y los contratos de la API.

> **Nota Técnica**: Para ejecutar tests locales contra la base de datos en contenedor, el sistema inyecta automáticamente `DB_HOST=localhost`.

## Documentación

El proyecto cuenta con documentación técnica detallada para sus dos capas de comunicación.

### Ver la documentación (Servidor activo)
Una vez arrancado el servidor con `npm run dev`, puedes acceder a:

*   **API REST (Swagger):** [http://localhost:3000/openapi-docs](http://localhost:3000/openapi-docs)
  >  ***Nota:** Se actualiza automáticamente al editar los archivos YAML en `docs/openapi/`.*
*   **WebSockets (AsyncAPI):** [http://localhost:3000/asyncapi-docs](http://localhost:3000/asyncapi-docs)

### Generar documentación de Sockets
A diferencia de REST, la documentación de WebSockets es estática y debe regenerarse si se realizan cambios en los archivos de `docs/asyncapi/`.

**Requisito:** Tener instalado el CLI de AsyncAPI (`npm install -g @asyncapi/cli`).

**Comando:**
```bash
npm run doc:async
```

## Estructura del Módulo

- `src/modules/auth`: Gestión de identidad, cifrado y JWT.
- `src/modules/engine`: Motor físico, cálculos de trayectoria y daño localizado.
- `src/modules/game`: Orquestación de partidas, lobbies y gestión de turnos.
- `src/modules/inventory`: Gestión de flotas, mazos y personalización de barcos.
- `src/shared`: Componentes transversales (Middleware de seguridad, Modelos base y Factorías de test).

## Configuración de Red

El sistema es autodetectable. Si se ejecuta mediante el orquestador global de la raíz, utiliza el host `db`. Si se ejecuta de forma independiente en esta carpeta, utiliza `localhost` para facilitar el desarrollo rápido.
