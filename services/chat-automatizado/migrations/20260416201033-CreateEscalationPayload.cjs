'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escalation_payload', {
      id_escalation: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_session: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'chat_session', key: 'id_session' },
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_type: {
        type: Sequelize.ENUM('cliente', 'repartidor', 'negocio'),
        allowNull: false,
      },
      // Categoría del problema detectada por el flujo
      problem_category: {
        type: Sequelize.ENUM(
          'problema_pedido_desconocido',
          'cargo_no_reconocido',
          'cliente_no_responde',
          'direccion_incorrecta',
          'problema_cobro_negocio',
          'problema_pedido_negocio',
          'pago_repartidor',
          'compensacion_fallida',
          'otro'
        ),
        allowNull: false,
      },
      // Estado XState donde se produjo la escalación
      escalation_state: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      previous_state: {
        type: Sequelize.STRING(50),
      },
      // Resumen generado automáticamente para el agente
      summary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // Historial completo serializado
      conversation_history: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      // Datos de contexto extra (order_code, compensation, etc.)
      context_data: {
        type: Sequelize.JSON,
      },
      // Estado del handoff al equipo de agentes
      handoff_status: {
        type: Sequelize.ENUM('pendiente', 'recibido', 'en_atencion', 'cerrado'),
        defaultValue: 'pendiente',
      },
      is_active: {
        type: Sequelize.TINYINT,
        defaultValue: 1,
      },
      created_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      update_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('escalation_payload');
  },
};