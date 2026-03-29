'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('faq_design', [

      {
        category_type: 'cliente',
        question: '¿Cómo rastreo mi pedido?',
        answer: 'Puede rastrear su pedido desde la sección Mis Pedidos.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué hago si el cliente no responde?',
        answer: 'Espere 5 minutos y repórtelo desde el menú de problema de entrega.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Cómo actualizo mi menú?',
        answer: 'Puede actualizarlo desde el panel de negocio.',
        faq_status: 'active'
      }

    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('faq_design', null, {});
  }
};