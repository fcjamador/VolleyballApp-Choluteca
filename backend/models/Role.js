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
        tableName: 'roles', // Nombre real de la tabla en la DB
        timestamps: false // No necesitamos campos createdAt y updatedAt para roles
    });

    return Role;
};