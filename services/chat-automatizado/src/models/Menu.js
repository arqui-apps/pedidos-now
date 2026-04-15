"use strict";

export default  (sequelize, DataTypes) => {
    const Menu = sequelize.define(
        "Menu",
        {
            id_menu: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            actual_state: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            menu_content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            audience_type: {
                type: DataTypes.ENUM(
                    "cliente",
                    "repartidor",
                    "negocio",
                    "todos"
                ),
                allowNull: true,
            },
            is_active: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            update_date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "menu",
            timestamps: false,
        }
    );

    return Menu;
};