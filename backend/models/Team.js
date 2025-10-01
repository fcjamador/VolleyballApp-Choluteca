'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Team extends Model {
        static associate(models) {
            // Un equipo puede tener muchos jugadores
            this.hasMany(models.Player, {
                foreignKey: 'teamId',
                as: 'players'
            });
            // Un equipo puede participar en muchos torneos
            this.belongsToMany(models.Tournament, {
                through: 'TournamentTeams', // <-- CORREGIDO
                as: 'Tournaments',
                foreignKey: 'teamId'
            });
        }
    }
    Team.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        coachName: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        logoUrl: { // Nuevo campo para la URL del logo
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Team',
        tableName: 'Teams', // <-- CORREGIDO
        timestamps: true
    });
    return Team;
};
