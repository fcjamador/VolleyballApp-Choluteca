const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Roles', // <-- CORREGIDO: de 'roles' a 'Roles'
        timestamps: false // No necesitamos campos createdAt y updatedAt para roles
    });

    return Role;
};
