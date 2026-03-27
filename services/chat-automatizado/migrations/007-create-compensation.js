'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('compensation', {

      id_compensacion: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      id_usuario: {
        type: Sequelize.INTEGER
      },

      id_session: {
        type: Sequelize.INTEGER,
        references: {
          model: 'chat_session',
          key: 'id_session'
        }
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2)
      },

      cupon_code: {
        type: Sequelize.STRING(100),
        defaultValue: null
      },

      expiration_date: {
        type: Sequelize.DATE,
        defaultValue: null
      },

      reason: {
        type: Sequelize.TEXT
      },

      compensation_type: {
        type: Sequelize.ENUM('cupon','reembolso')
      },

      compensation_status: {
        type: Sequelize.ENUM('usado','expirado','pendiente','procesado','rechazado')
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
    await queryInterface.dropTable('compensation');
  }
};
