'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('problem_catalog', {

      id_problem: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      problem_name: {
        type: Sequelize.STRING(100)
      },

      problem_description: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('problem_catalog');
  }
};
