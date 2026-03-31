/**
 * Global Game Rules Configuration
 * Centralizes balancing values to facilitate adjustments without touching logic.
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