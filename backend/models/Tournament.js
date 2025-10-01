// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/backend/models/Tournament.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tournament extends Model {
    static associate(models) {
      // Un torneo tiene muchos equipos, a través de una tabla intermedia
      this.belongsToMany(models.Team, {
        through: 'TournamentTeams',
        as: 'Teams',
        foreignKey: 'tournamentId'
      });
      // Un torneo tiene muchos partidos
      this.hasMany(models.Match, {
        foreignKey: 'tournamentId',
        as: 'matches'
      });
      // --- NUEVA RELACIÓN ---
      // Un torneo tiene muchos grupos
      this.hasMany(models.TournamentGroup, {
        foreignKey: 'tournamentId',
        as: 'groups'
      });
    }
  }
  Tournament.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('Programado', 'Activo', 'Completado', 'Cancelado'),
      defaultValue: 'Programado'
    },
    type: {
      type: DataTypes.ENUM('League', 'Knockout', 'Group Stage'),
      defaultValue: 'League'
    },
    defaultNumberOfSets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      comment: 'Número de sets por defecto para los partidos del torneo (e.g., 3 o 5).'
    }
  }, {
    sequelize,
    modelName: 'Tournament',
    tableName: 'Tournaments',
    timestamps: true
  });
  return Tournament;
};
