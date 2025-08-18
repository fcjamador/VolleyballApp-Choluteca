// Ruta: backend/models/tournamentgroup.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TournamentGroup extends Model {
    static associate(models) {
      // Un grupo pertenece a un solo torneo
      TournamentGroup.belongsTo(models.Tournament, {
        foreignKey: 'tournamentId',
        as: 'tournament'
      });

      // Un grupo puede tener muchos partidos (los de la fase de grupos)
      TournamentGroup.hasMany(models.Match, {
        foreignKey: 'groupId',
        as: 'matches'
      });
    }
  }
  TournamentGroup.init({
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TournamentGroup',
  });
  return TournamentGroup;
};
