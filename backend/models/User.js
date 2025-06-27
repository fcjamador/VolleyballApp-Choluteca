const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: { // Almacenará el hash de la contraseña
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: { // Para habilitar/deshabilitar usuarios
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        // El campo para el rol se definirá en las asociaciones
    }, {
        tableName: 'users',
        timestamps: true // Para createdAt y updatedAt
    });

    // Definición de la asociación (se ejecutará en index.js)
    User.associate = (models) => {
        User.belongsTo(models.Role, {
            foreignKey: 'roleId', // Nombre de la columna que será la FK en la tabla users
            as: 'role'
        });
    };

    return User;
};