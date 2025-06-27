const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: { // Usuario que realizó la acción
            type: DataTypes.INTEGER,
            allowNull: true // Podría ser null si la acción no la hizo un usuario logueado
        },
        action: { // Ej: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
            type: DataTypes.STRING(50),
            allowNull: false
        },
        entityType: { // Ej: 'User', 'Team', 'Match', 'Tournament'
            type: DataTypes.STRING(100),
            allowNull: false
        },
        entityId: { // ID de la entidad afectada
            type: DataTypes.INTEGER,
            allowNull: true // Podría ser null para acciones generales
        },
        oldData: { // Datos antes del cambio (JSON)
            type: DataTypes.JSONB, // JSONB para PostgreSQL es eficiente
            allowNull: true
        },
        newData: { // Datos después del cambio (JSON)
            type: DataTypes.JSONB,
            allowNull: true
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'logs',
        timestamps: false // Manually manage timestamp
    });

    Log.associate = (models) => {
        // Un log está asociado a un usuario
        Log.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return Log;
};