'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    static associate(models) {
      // Un jugador pertenece a un equipo
      this.belongsTo(models.Team, {
        foreignKey: 'teamId',
        as: 'team'
      });
    }
  }
  Player.init({
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
    nationalId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    jerseyNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    position: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Player',
    tableName: 'Players',
    timestamps: true
  });
  return Player;
};
