"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("mensaje", "message_sender", {
            type: Sequelize.ENUM(
                "bot",
                "cliente",
                "repartidor",
                "negocio"
            ),
            allowNull: false,
            defaultValue: "bot",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
            UPDATE mensaje
            SET message_sender = 'cliente'
            WHERE message_sender IN ('repartidor', 'negocio')
        `);

        await queryInterface.changeColumn("mensaje", "message_sender", {
            type: Sequelize.ENUM("bot", "cliente"),
            allowNull: false,
            defaultValue: "bot",
        });
    },
};