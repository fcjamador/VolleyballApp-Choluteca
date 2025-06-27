const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Player = sequelize.define('Player', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        jerseyNumber: {
            type: DataTypes.INTEGER,
            allowNull: true // Puede que algunos jugadores no tengan número fijo al inicio
        },
        position: { // Ej: Armador, Atacante, Libero, Central
            type: DataTypes.STRING(50),
            allowNull: true
        },
        // El campo para el equipo se definirá en las asociaciones
    }, {
        tableName: 'players',
        timestamps: true
    });

    Player.associate = (models) => {
        // Un jugador pertenece a un equipo
        Player.belongsTo(models.Team, {
            foreignKey: 'teamId', // Nombre de la columna que será la FK en la tabla players
            as: 'team'
        });
    };

    return Player;
};