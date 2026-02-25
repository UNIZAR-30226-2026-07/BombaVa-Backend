# BombaVa - Táctico Naval (Backend)

Soporte lógico y motor de juego para el ecosistema BombaVa. Implementado con una arquitectura de Monolito Modular, comunicación híbrida (REST + WebSockets) y persistencia en PostgreSQL.

## Requisitos Previos

- **Entorno de Contenedores**: Docker o Podman (con `docker-compose` instalado).
- **Node.js**: v20+ (Solo si deseas ejecutar tests o desarrollo fuera de contenedores).
- **Herramienta de Construcción**: `make` instalado en el sistema.

## Flujo de Trabajo (Makefile)

Hemos estandarizado las operaciones mediante un `Makefile` para evitar errores de configuración manual.

| Comando | Acción |
| :--- | :--- |
| `make help` | Muestra la lista de comandos disponibles. |
| `make infra-up` | Levanta la base de datos PostgreSQL en segundo plano. |
| `make test` | Ejecuta la suite de pruebas contra la base de datos de Docker. |
| `make run` | Arranca el servidor en modo desarrollo con Hot-Reload. |
| `make infra-down` | Detiene la base de datos y limpia los volúmenes. |

## Estrategia de Testing

El proyecto utiliza **Tests Colocalizados** para mantener la documentación técnica cerca de la implementación.

1. **Tests Unitarios (`*.test.js`)**: Validan lógica pura, cálculos del motor y servicios sin dependencias externas.
2. **Tests de Integración (`*.int.test.js`)**: Validan la persistencia real en PostgreSQL y los contratos de la API.

> **Nota Técnica**: Para ejecutar tests locales contra la base de datos en contenedor, el sistema inyecta automáticamente `DB_HOST=localhost`.

## Estructura del Módulo

- `src/modules/auth`: Gestión de identidad, cifrado y JWT.
- `src/modules/engine`: Motor físico, cálculos de trayectoria y daño localizado.
- `src/modules/game`: Orquestación de partidas, lobbies y gestión de turnos.
- `src/modules/inventory`: Gestión de flotas, mazos y personalización de barcos.
- `src/shared`: Componentes transversales (Middleware de seguridad, Modelos base y Factorías de test).

## Configuración de Red

El sistema es autodetectable. Si se ejecuta mediante el orquestador global de la raíz, utiliza el host `db`. Si se ejecuta de forma independiente en esta carpeta, utiliza `localhost` para facilitar el desarrollo rápido.

## Seguridad y Estándares

- **Autoridad del Servidor**: Toda validación de movimiento o disparo se realiza en el backend. El cliente es una representación visual "tonta".
- **Niebla de Guerra**: El servidor filtra la información de las unidades enemigas antes de enviarlas por socket según el rango de visión.
- **Transaccionalidad**: Todas las operaciones críticas de base de datos (como el consumo de recursos en un turno) utilizan transacciones SQL para asegurar la integridad.
