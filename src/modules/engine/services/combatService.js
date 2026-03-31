/**
 * Servicio de Combate
 * Lógica pura de cálculos de daño y resolución de proyectiles.
 */
import { GAME_RULES } from '../../../config/gameRules.js';
import EngineDao from '../dao/EngineDao.js';
import ProjectileDao from '../dao/ProjectileDao.js';
import { calcularCeldasOcupadas } from './engineService.js';

/**
 * Valida si un ataque está en rango usando distancia de Manhattan
 */
export const validarRangoAtaque = (origen, destino, rangoMax) => {
    const distancia = Math.abs(destino.x - origen.x) + Math.abs(destino.y - origen.y);
    return distancia <= rangoMax;
};

/**
 * Calcula el vector de dirección del proyectil
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
 * Valida si una posición es adyacente (radio de 1 celda)
 */
export const validarAdyacencia = (pos1, pos2) => {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1;
};

/**
 * Aplica daño a un barco y actualiza su estado de hundido
 */
export const aplicarDañoImpacto = async (objetivo, danioDelArma, transaccion) => {
    let newHp = objetivo.currentHp - danioDelArma;
    if (newHp < 0) newHp = 0;

    const isSunk = newHp === 0;
    await objetivo.update({
        currentHp: newHp,
        isSunk: isSunk
    }, { transaction: transaccion });

    return { newHp, isSunk };
};

/**
 * Resuelve el movimiento de torpedos y explosión de minas al final del turno
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
                    const { newHp, isSunk } = await aplicarDañoImpacto(ship, damage, transaction);
                    
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