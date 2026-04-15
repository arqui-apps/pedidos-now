"use strict";

export default (sequelize, DataTypes) => {
    const OptionChoice = sequelize.define(
        "OptionChoice",
        {
            id_option: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            id_menu: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            option_answer: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            next_state: {
                type: DataTypes.STRING(50),
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
            tableName: "option_choice",
            timestamps: false,
        }
    );

    return OptionChoice;
};