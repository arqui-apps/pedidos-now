'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('menu', {

      id_menu: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      actual_state: {
        type: Sequelize.STRING(50),
        allowNull: false
      },

      menu_content: {
        type: Sequelize.TEXT
      },

      audience_type: {
        type: Sequelize.ENUM('cliente','repartidor','negocio','todos')
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
    await queryInterface.dropTable('menu');
  }
};
