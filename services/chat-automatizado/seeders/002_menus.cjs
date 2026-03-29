'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu', [
      { 
        actual_state: 'MENU_PRINCIPAL_CLIENTE', 
        menu_content: 'Bienvenido Cliente. Selecciona una opción:\n1 Problema con pedido\n2 Problema de cobro\n3 Consultar pedido\n4 Preguntas frecuentes',
        audience_type: 'cliente'
      },
      { 
        actual_state: 'MENU_PRINCIPAL_REPARTIDOR', 
        menu_content: 'Bienvenido Repartidor. Selecciona una opción:\n1 Problema con entrega\n2 Problema con pago\n3 Soporte en carretera\n4 Preguntas frecuentes',
        audience_type: 'repartidor'
      },
      { 
        actual_state: 'MENU_PRINCIPAL_NEGOCIO', 
        menu_content: 'Bienvenido Negocio. Selecciona una opción:\n1 Problema con pedido\n2 Cancelar pedido\n3 Problema de cobro\n4 Preguntas frecuentes',
        audience_type: 'negocio'
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu', null, {});
  }
};