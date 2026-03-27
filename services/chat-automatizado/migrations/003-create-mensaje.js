'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('mensaje', {

      id_mensaje: {
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

      message_sender: {
        type: Sequelize.ENUM('bot','cliente'),
        allowNull: false,
        defaultValue: 'bot'
      },

      message_content: {
        type: Sequelize.TEXT
      },

      sent_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.dropTable('mensaje');
  }
};
