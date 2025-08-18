'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tournamentId: {
        type: Sequelize.INTEGER,
        references: { model: 'Tournaments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      team1Id: {
        type: Sequelize.INTEGER,
        references: { model: 'Teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      team2Id: {
        type: Sequelize.INTEGER,
        references: { model: 'Teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      team1Score: { type: Sequelize.INTEGER },
      team2Score: { type: Sequelize.INTEGER },
      winnerId: {
        type: Sequelize.INTEGER,
        references: { model: 'Teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      matchDate: { type: Sequelize.DATEONLY },
      matchTime: { type: Sequelize.TIME },
      location: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      phase: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Matches');
  }
};