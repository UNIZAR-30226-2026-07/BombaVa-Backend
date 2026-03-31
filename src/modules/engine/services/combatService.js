/**
 * Servicio de Combate
 * Lógica pura de cálculos de daño y resolución de proyectiles.
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import EngineDao from '../dao/EngineDao.js';
import ProjectileDao from '../dao/ProjectileDao.js';
import { calcularCeldasOcupadas } from './engineService.js';

/**
 * Valida si un ataque está en rango usando distancia de Manhattan.
 * @param {Object} origen - Coordenadas de origen {x, y}.
 * @param {Object} destino - Coordenadas de destino {x, y}.
 * @param {number} rangoMax - Rango máximo permitido.
 * @returns {boolean} Verdadero si está en rango.
 */
export const validarRangoAtaque = (origen, destino, rangoMax) => {
    const distancia = Math.abs(destino.x - origen.x) + Math.abs(destino.y - origen.y);
    return distancia <= rangoMax;
};

/**
 * Calcula el vector de dirección del proyectil basado en la orientación.
 * @param {string} orientacion - Orientación cardinal (N, S, E, W).
 * @returns {Object} Vector de avance {vx, vy}.
 */
export const calcularVectorProyectil = (orientacion) => {
    const vectores = {
        'N': { vx: 0, vy: -1 },
        'S': { vx: 0, vy: 1 },
        'E': { vx: 1, vy: 0 },
        'W': { vx: -1, vy: 0 }
    };
    return vectores[orientacion] || { vx: 0, vy: 0 };
};

/**
 * Valida si una posición es adyacente (radio de 1 celda).
 * @param {Object} pos1 - Coordenadas 1 {x, y}.
 * @param {Object} pos2 - Coordenadas 2 {x, y}.
 * @returns {boolean} Verdadero si son adyacentes.
 */
export const validarAdyacencia = (pos1, pos2) => {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1;
};

/**
 * Busca un barco que ocupe las coordenadas especificadas, considerando su tamaño completo.
 * @param {string} matchId - Identificador de la partida.
 * @param {number} x - Coordenada X del impacto.
 * @param {number} y - Coordenada Y del impacto.
 * @returns {Promise<Object|null>} Objeto con el barco y la celda impactada, o null.
 */
export const encontrarObjetivo = async (matchId, x, y) => {
    const barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);
    for (const ship of barcosVivos) {
        const size = Math.max(ship.UserShip.ShipTemplate.width, ship.UserShip.ShipTemplate.height);
        const cells = calcularCeldasOcupadas(ship.x, ship.y, ship.orientation, size);
        for (const cell of cells) {
            if (cell.x === x && cell.y === y) {
                return { ship, hitCell: cell };
            }
        }
    }
    return null;
};

/**
 * Aplica daño a un barco y actualiza su estado de hundido y celdas destruidas.
 * @param {Object} objetivo - Instancia del barco objetivo.
 * @param {number} danioDelArma - Cantidad de daño a aplicar.
 * @param {Object} hitCell - Coordenadas de la celda específica impactada {x, y}.
 * @param {Object} transaccion - Transacción de base de datos.
 * @returns {Promise<Object>} Resultado del impacto.
 */
export const aplicarDañoImpacto = async (objetivo, danioDelArma, hitCell, transaccion) => {
    let newHp = objetivo.currentHp - danioDelArma;
    if (newHp < 0) newHp = 0;

    const isSunk = newHp === 0;
    const currentHitCells = objetivo.hitCells || [];
    const updatedHitCells = [...currentHitCells, hitCell];

    await objetivo.update({
        currentHp: newHp,
        hitCells: updatedHitCells,
        isSunk: isSunk
    }, { transaction: transaccion });

    return { newHp, isSunk, updatedHitCells };
};

/**
 * Resuelve el movimiento de torpedos y explosión de minas al final del turno.
 * @param {string} matchId - Identificador de la partida.
 * @param {Object} transaction - Transacción de base de datos.
 * @returns {Promise<Array>} Lista de impactos reportados.
 */
export const resolverProyectiles = async (matchId, transaction) => {
    const proyectiles = await ProjectileDao.findAllByMatch(matchId, transaction);
    const barcosVivos = await EngineDao.findAllAliveShipsWithSizes(matchId);
    const impactosReportados = [];

    for (const p of proyectiles) {
        let impactoDetectado = false;
        
        if (p.type === 'TORPEDO') {
            p.x += p.vectorX;
            p.y += p.vectorY;
        }

        p.lifeDistance -= 1;

        for (const ship of barcosVivos) {
            if (impactoDetectado) break;

            const size = Math.max(ship.UserShip.ShipTemplate.width, ship.UserShip.ShipTemplate.height);
            const cells = calcularCeldasOcupadas(ship.x, ship.y, ship.orientation, size);

            for (const cell of cells) {
                if (cell.x === p.x && cell.y === p.y) {
                    const damage = p.type === 'TORPEDO' ? GAME_RULES.COMBAT.DAMAGE_TORPEDO : GAME_RULES.COMBAT.DAMAGE_MINE;
                    const { newHp, isSunk } = await aplicarDañoImpacto(ship, damage, cell, transaction);
                    
                    impactosReportados.push({
                        projectileType: p.type,
                        x: p.x,
                        y: p.y,
                        targetId: ship.id,
                        newHp,
                        isSunk
                    });

                    impactoDetectado = true;
                    await ProjectileDao.deleteById(p.id, transaction);
                    break;
                }
            }
        }

        if (!impactoDetectado) {
            if (p.lifeDistance <= 0 || p.x < 0 || p.x >= GAME_RULES.MAP.SIZE || p.y < 0 || p.y >= GAME_RULES.MAP.SIZE) {
                await ProjectileDao.deleteById(p.id, transaction);
            } else {
                await p.update({ x: p.x, y: p.y, lifeDistance: p.lifeDistance }, { transaction });
            }
        }
    }

    return impactosReportados;
};