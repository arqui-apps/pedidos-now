'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('faq_design', {

      id_faq: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      category_type: {
        type: Sequelize.ENUM(
          'cliente',
          'repartidor',
          'restaurante',
          'farmacia',
          'supermercado',
          'paqueteria'
        )
      },

      question: {
        type: Sequelize.TEXT
      },

      answer: {
        type: Sequelize.TEXT
      },

      faq_status: {
        type: Sequelize.ENUM('active','inactive','archive'),
        defaultValue: 'active'
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
    await queryInterface.dropTable('faq_design');
  }
};
