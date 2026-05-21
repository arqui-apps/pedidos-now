const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database').sequelize;

const Entrega = sequelize.define('Entrega', {
    id_entrega: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_origen: {
        type: DataTypes.ENUM('pedido', 'cotizacion', 'manual'),
        allowNull: false,
        comment: 'Tipo de origen de la entrega'
    },
    origen_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del pedido/cotización en módulo de negocios'
    },
    empresa_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del restaurante o negocio'
    },
    sucursal_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID de la sucursal (si aplica)'
    },
    cliente_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'ID del cliente que recibirá la entrega'
    },
    categoria_id: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: 'FK a categorias_orden'
    },
    metodo_pago: {
        type: DataTypes.ENUM('CASH', 'CARD'),
        allowNull: false,
        comment: 'Método de pago'
    },
    tarifa_ofrecida: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Ganancia del repartidor'
    },
    monto_cobrar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Total del pedido al cliente'
    },
    distancia_estimada_km: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        comment: 'Distancia estimada en kilómetros'
    },
    estado_entrega: {
        type: DataTypes.ENUM(
            'pendiente',
            'asignada',
            'en_ruta',
            'entregada',
            'fallida',
            'cancelada'
        ),
        allowNull: false,
        defaultValue: 'pendiente',
        comment: 'Estado actual de la entrega'
    },
    activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la entrega está activa'
    },
    negocio_nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre del negocio/remitente'
    },
    negocio_telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Teléfono del negocio'
    },
    negocio_direccion: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Dirección del negocio/origen'
    },
    origen_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        comment: 'Latitud del origen'
    },
    origen_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        comment: 'Longitud del origen'
    },
    cliente_nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nombre del cliente/destinatario'
    },
    cliente_telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Teléfono del cliente'
    },
    direccion_entrega: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Dirección completa de entrega'
    },
    referencia_direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Referencias adicionales de ubicación'
    },
    instrucciones_entrega: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Instrucciones especiales para el repartidor'
    },
    destino_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        comment: 'Latitud del destino'
    },
    destino_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        comment: 'Longitud del destino'
    },
    detalles_orden: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array de strings con detalles de productos'
    },
    cancelacion_auto_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp para cancelación automática si nadie acepta'
    },
    motivo_cancelacion: {
        type: DataTypes.ENUM(
            'cancelacion_automatica',
            'cancelado_por_negocio',
            'cancelado_por_admin',
            'error_sistema'
        ),
        allowNull: true,
        comment: 'Motivo de cancelación'
    },
    fecha_entrega_estimada: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha/hora estimada de entrega'
    },
    fecha_entrega_real: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha/hora real de entrega completada'
    }
}, {
    tableName: 'entregas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['empresa_id'], name: 'idx_entregas_empresa' },
        { fields: ['sucursal_id'], name: 'idx_entregas_sucursal', where: { sucursal_id: { [sequelize.Sequelize.Op.ne]: null } } },
        { fields: ['cliente_id'], name: 'idx_entregas_cliente' },
        { fields: ['estado_entrega'], name: 'idx_entregas_estado' },
        { fields: ['activa'], name: 'idx_entregas_activa' },
        { fields: ['tipo_origen', 'origen_id'], name: 'idx_entregas_origen' },
        { fields: ['categoria_id'], name: 'idx_entregas_categoria' },
        { 
            fields: ['cancelacion_auto_at'], 
            name: 'idx_entregas_cancelacion_auto',
            where: { 
                cancelacion_auto_at: { [sequelize.Sequelize.Op.ne]: null },
                estado_entrega: 'pendiente'
            }
        },
        { fields: ['origen_lat', 'origen_lng'], name: 'idx_entregas_coords_origen' }
    ],
    comment: 'Registro principal de entregas. Persiste datos de negocios para independencia operativa'
});

module.exports = Entrega;
