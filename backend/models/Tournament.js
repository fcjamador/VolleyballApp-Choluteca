const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Tournament = sequelize.define('Tournament', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        startDate: {
            type: DataTypes.DATEONLY, // Solo fecha, sin hora
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: { // Ej: 'Planned', 'Active', 'Completed', 'Cancelled'
            type: DataTypes.ENUM('Planned', 'Active', 'Completed', 'Cancelled'),
            defaultValue: 'Planned',
            allowNull: false
        },
        type: { // Ej: 'League' (Liga), 'Knockout' (Eliminatoria), 'Mixed'
            type: DataTypes.ENUM('League', 'Knockout', 'Mixed'),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'tournaments',
        timestamps: true
    });

    Tournament.associate = (models) => {
        // Un torneo puede tener muchos partidos
        Tournament.hasMany(models.Match, {
            foreignKey: 'tournamentId',
            as: 'matches'
        });
        // Muchos a Muchos: Los torneos tienen equipos participantes
        Tournament.belongsToMany(models.Team, {
            through: 'TournamentTeams', // Tabla intermedia
            foreignKey: 'tournamentId',
            otherKey: 'teamId',
            as: 'participatingTeams'
        });
    };

    return Tournament;
};