'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('order_inquiry', {

      id_inquiry: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      id_session: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_session',
          key: 'id_session'
        }
      },

      inquiry_type: {
        type: Sequelize.ENUM('pedido','cliente','repartidor'),
        allowNull: false
      },

      input_value: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      inquiry_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      result_found: {
        type: Sequelize.TINYINT,
        defaultValue: 0
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
    await queryInterface.dropTable('order_inquiry');
  }
};
