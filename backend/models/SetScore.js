'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SetScore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un marcador de set pertenece a un partido
      this.belongsTo(models.Match, {
        foreignKey: 'matchId',
        as: 'match',
      });
    }
  }
  SetScore.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    setNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team1Score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    team2Score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'SetScore',
    tableName: 'SetScores',
    timestamps: true,
  });
  return SetScore;
};
