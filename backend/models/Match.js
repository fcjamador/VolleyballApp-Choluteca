const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Match = sequelize.define('Match', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        matchDate: {
            type: DataTypes.DATE, // Fecha y hora del partido
            allowNull: false
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true // Puede ser una cancha específica
        },
        team1Score: {
            type: DataTypes.INTEGER,
            allowNull: true // Será null hasta que el partido se juegue
        },
        team2Score: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        winnerTeamId: {
            type: DataTypes.INTEGER,
            allowNull: true // Id del equipo ganador
        },
        phase: { // Ej: 'Group Stage', 'Quarter-Final', 'Semi-Final', 'Final'
            type: DataTypes.ENUM('Group Stage', 'Quarter-Final', 'Semi-Final', 'Final'),
            allowNull: false,
            defaultValue: 'Group Stage'
        },
        // Las FKs tournamentId, team1Id, team2Id se definen en asociaciones
    }, {
        tableName: 'matches',
        timestamps: true
    });

    Match.associate = (models) => {
        // Un partido pertenece a un torneo
        Match.belongsTo(models.Tournament, {
            foreignKey: 'tournamentId',
            as: 'tournament'
        });
        // Un partido tiene dos equipos
        Match.belongsTo(models.Team, {
            foreignKey: 'team1Id',
            as: 'team1'
        });
        Match.belongsTo(models.Team, {
            foreignKey: 'team2Id',
            as: 'team2'
        });
        // El ganador del partido (opcional, si quieres una referencia directa)
        Match.belongsTo(models.Team, {
            foreignKey: 'winnerTeamId',
            as: 'winner'
        });
    };

    return Match;
};