'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('chat_session', {

      id_session: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      user_type: {
        type: Sequelize.ENUM('cliente','repartidor','negocio'),
        allowNull: false
      },

      current_state: {
        type: Sequelize.STRING(50),
        defaultValue: null
      },

      previous_state: {
        type: Sequelize.STRING(50),
        defaultValue: null
      },

      chat_context: {
        type: Sequelize.JSON
      },

      start_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      end_time: {
        type: Sequelize.DATE,
        defaultValue: null
      },

      session_status: {
        type: Sequelize.ENUM('active','inactive','expired'),
        defaultValue: 'active'
      },

      resolution: {
        type: Sequelize.ENUM(
          'resuelto',
          'resuelto_con_cupon',
          'resuelto_con_reembolso',
          'escalado_a_agente',
          'cerrado_sin_resolver'
        ),
        defaultValue: null
      },

      is_active: {
        type: Sequelize.TINYINT,
        defaultValue: 1
      },

      created_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      update_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_session');
  }
};
