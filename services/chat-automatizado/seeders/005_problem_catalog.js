'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('problem_catalog', [

      {
        problem_name: 'Pedido no llegó',
        problem_description: 'El cliente indica que su pedido no fue entregado',
        is_active: 1
      },
      {
        problem_name: 'Cobro duplicado',
        problem_description: 'El cliente reporta que se realizó un doble cobro',
        is_active: 1
      },
      {
        problem_name: 'Cliente no responde',
        problem_description: 'El repartidor no logra contactar al cliente',
        is_active: 1
      }

    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('problem_catalog', null, {});
  }
};