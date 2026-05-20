// Admin-contabilidad Victor

const { sequelize } = require('../config/db');

const EntidadComercial = require('./entidadComercial.model')(sequelize);
const PedidoContabilidad = require('./pedidoContabilidad.model')(sequelize);
const MovimientoFinanciero = require('./movimientoFinanciero.model')(sequelize);

// Relaciones
EntidadComercial.hasMany(PedidoContabilidad, {
    foreignKey: 'entidad_comercial_id',
    as: 'pedidos_contabilidad'
});

PedidoContabilidad.belongsTo(EntidadComercial, {
    foreignKey: 'entidad_comercial_id',
    as: 'entidad_comercial'
});

module.exports = {
    sequelize,
    EntidadComercial,
    PedidoContabilidad,
    MovimientoFinanciero
};
