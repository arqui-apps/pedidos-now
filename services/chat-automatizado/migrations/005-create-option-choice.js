'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('option_choice', {

      id_option: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      id_menu: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'menu',
          key: 'id_menu'
        }
      },

      option_answer: {
        type: Sequelize.STRING(50)
      },

      next_state: {
        type: Sequelize.STRING(50)
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
    await queryInterface.dropTable('option_choice');
  }
};
