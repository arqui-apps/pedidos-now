'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('support_request', {

      id_support_request: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      id_delivery: {
        type: Sequelize.INTEGER
      },

      id_pedido: {
        type: Sequelize.INTEGER
      },

      id_session: {
        type: Sequelize.INTEGER,
        references: {
          model: 'chat_session',
          key: 'id_session'
        }
      },

      id_problem: {
        type: Sequelize.INTEGER,
        references: {
          model: 'problem_catalog',
          key: 'id_problem'
        }
      },

      request_status: {
        type: Sequelize.ENUM('pendiente','en_proceso','resuelto','cancelado'),
        defaultValue: 'pendiente'
      },

      problem_details: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('support_request');
  }
};
