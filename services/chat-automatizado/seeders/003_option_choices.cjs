'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('option_choice', [
        
      // OPCIONES DEL MENÚ CLIENTE (id_menu: 1)
      { id_menu: 1, option_answer: '1', next_state: 'PROBLEMA_PEDIDO' },
      { id_menu: 1, option_answer: '2', next_state: 'PROBLEMA_COBRO' },
      { id_menu: 1, option_answer: '3', next_state: 'CONSULTA_PEDIDO' },
      { id_menu: 1, option_answer: '4', next_state: 'FAQ_CLIENTE' },

      // OPCIONES DEL MENÚ REPARTIDOR (id_menu: 2)
      { id_menu: 2, option_answer: '1', next_state: 'PROBLEMA_ENTREGA' },
      { id_menu: 2, option_answer: '2', next_state: 'PROBLEMA_PAGO_REPARTIDOR' },
      { id_menu: 2, option_answer: '3', next_state: 'SOPORTE_CARRETERA' },
      { id_menu: 2, option_answer: '4', next_state: 'FAQ_REPARTIDOR' },

      // OPCIONES DEL MENÚ NEGOCIO (id_menu: 3)
      { id_menu: 3, option_answer: '1', next_state: 'PROBLEMA_PEDIDO_NEGOCIO' },
      { id_menu: 3, option_answer: '2', next_state: 'CANCELAR_PEDIDO_NEGOCIO' },
      { id_menu: 3, option_answer: '3', next_state: 'PROBLEMA_COBRO_NEGOCIO' },
      { id_menu: 3, option_answer: '4', next_state: 'FAQ_NEGOCIO' }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('option_choice', null, {});
  }
};