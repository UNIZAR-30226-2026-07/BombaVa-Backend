/**
 * Configuración Global de Reglas de Juego
 * Centraliza los valores de balanceo para facilitar ajustes sin tocar la lógica.
 */
export const GAME_RULES = {
    MAP: {
        SIZE: 15,
        DEPLOY_ZONE_Y: 4
    },
    RESOURCES: {
        MAX_FUEL: 30,
        REGEN_FUEL: 10,
        RESET_AMMO: 5,
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