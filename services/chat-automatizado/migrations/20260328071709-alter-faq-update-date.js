'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE faq_design
      MODIFY update_date DATETIME NOT NULL
      DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE faq_design
      MODIFY update_date DATETIME NOT NULL
      DEFAULT CURRENT_TIMESTAMP
    `);
  },
};
