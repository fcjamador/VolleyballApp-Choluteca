'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Log extends Model {
        static associate(models) {
            // Un log está asociado a un usuario
            this.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }
    Log.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        entityType: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        oldData: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        newData: {
            type: DataTypes.JSONB,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Log',
        tableName: 'Logs', // <-- CORREGIDO: de 'logs' a 'Logs'
        timestamps: true // Usar createdAt y updatedAt de Sequelize
    });
    return Log;
};
