Este documento define la estructura y el protocolo de validación del back-end. Todo código debe ser validado según su nivel de criticidad.

# 1. Niveles de Test

| Nivel | Ubicación | Objetivo | Mocking |
| :--- | :--- | :--- | :--- |
| **Unitario** | `src/**/*.test.js` | Probar funciones puras y lógica de negocio aislada. | **Total**. No toca DB ni Red. |
| **Integración** | `tests/integration/` | Validar contratos de API y persistencia en PostgreSQL. | **Mínimo**. Usa Docker DB real. |
| **E2E** | `tests/e2e/` | Simular una partida completa desde la perspectiva del cliente. | **Nulo**. Sistema real. |

# 2. Reglas de Co-ubicación
Los tests unitarios deben residir en la misma carpeta que el archivo que testean.
*   **Identificación:** Deben llevar el sufijo `.test.js`.
*   **Co-ubicación:** Al estar al lado, la documentación técnica (el test) siempre a la vista mientras edita la lógica.

# 3. Protocolo de Ejecución
Utilizaremos **Jest** con configuraciones separadas para no ralentizar el desarrollo:
*   `npm run test:unit`: Solo ejecuta los tests co-ubicados (rápido).
*   `npm run test:integration`: Ejecuta la carpeta `/tests/integration` (requiere Docker).
*   `npm test`: Ejecuta la suite completa.

# 4. Definición de "Suficiencia"
No se considera aceptable un módulo si no cumple:
1.  **Lógica del Engine:** 100% de cobertura en cálculos de movimiento y colisión.
2.  **Auth:** Validación de todos los "edge cases" de tokens y contraseñas.
3.  **Smoke Test:** Un test de integración por cada endpoint nuevo creado.
