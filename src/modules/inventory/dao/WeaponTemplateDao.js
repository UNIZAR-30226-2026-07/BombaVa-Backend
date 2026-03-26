/**
 * DAO para Plantillas de Armamento
 */
import WeaponTemplate from '../models/WeaponTemplate.js';

class WeaponTemplateDao {
    /**
     * Obtiene todas las armas disponibles en el sistema
     */
    async findAll() {
        return await WeaponTemplate.findAll();
    }

    /**
     * Busca una arma específica por su identificador (slug)
     */
    async findBySlug(slug) {
        return await WeaponTemplate.findByPk(slug);
    }
}

export default new WeaponTemplateDao();