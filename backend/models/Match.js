// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/backend/models/Match.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Match extends Model {
        static associate(models) {
            this.belongsTo(models.Tournament, {
                foreignKey: 'tournamentId',
                as: 'tournament'
            });
            this.belongsTo(models.Team, {
                foreignKey: 'localTeamId',
                as: 'localTeam'
            });
            this.belongsTo(models.Team, {
                foreignKey: 'visitorTeamId',
                as: 'visitorTeam'
            });
            this.belongsTo(models.Team, {
                foreignKey: 'winnerId',
                as: 'winner'
            });
            this.hasMany(models.SetScore, {
                foreignKey: 'matchId',
                as: 'setScores',
                onDelete: 'CASCADE'
            });
            // --- NUEVA RELACIÓN ---
            // Un partido puede pertenecer a un grupo (para la fase de grupos)
            this.belongsTo(models.TournamentGroup, {
                foreignKey: 'groupId',
                as: 'group',
                allowNull: true
            });
        }
    }
    Match.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tournamentId: { // Aseguramos que este campo esté definido en el modelo
            type: DataTypes.INTEGER,
            allowNull: false
        },
        numberOfSets: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
        },
        matchDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        matchTime: {
            type: DataTypes.TIME,
            allowNull: true
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        localTeamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        visitorTeamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        team1Score: { // Sets ganados por el equipo local
            type: DataTypes.INTEGER,
            allowNull: true
        },
        team2Score: { // Sets ganados por el equipo visitante
            type: DataTypes.INTEGER,
            allowNull: true
        },
        winnerId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        phase: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Programado', 'Activo', 'Completado', 'Cancelado'),
            allowNull: false,
            defaultValue: 'Programado'
        },
        // --- CAMPOS DE TIEMPOS FUERA ---
        localTeamTimeouts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        },
        visitorTeamTimeouts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        },
        timeoutActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        timeoutTeamId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        timeoutStartTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // --- NUEVO CAMPO AÑADIDO ---
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Match',
        tableName: 'Matches',
        timestamps: true
    });
    return Match;
};
