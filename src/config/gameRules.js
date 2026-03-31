/**
 * Configuración Global de Reglas de Juego
 * Centraliza los valores de balanceo para facilitar ajustes sin tocar la lógica del motor.
 * @constant {Object} GAME_RULES
 * @property {Object} MAP - Configuración del tablero.
 * @property {Object} RESOURCES - Gestión de costes y regeneración de combustible/munición.
 * @property {Object} COMBAT - Valores de daño y persistencia de proyectiles.
 */
export const GAME_RULES = {
    MAP: {
        SIZE: 15,
        DEPLOY_ZONE_Y: 4
    },
    RESOURCES: {
        MAX_FUEL: 10,
        RESET_FUEL: 10,
        RESET_AMMO: 10,
        COST_MOVE: 1,
        COST_ROTATE: 2,
        COST_CANNON: 2,
        COST_TORPEDO: 3,
        COST_MINE: 2
    },
    COMBAT: {
        DAMAGE_CANNON: 10,
        DAMAGE_TORPEDO: 20,
        DAMAGE_MINE: 25,
        CANNON_RANGE: 4,
        TORPEDO_LIFE: 6,
        MINE_LIFE: 10
    }
};