'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Renombrar team1Id a localTeamId
    await queryInterface.renameColumn('Matches', 'team1Id', 'localTeamId');
    // Renombrar team2Id a visitorTeamId
    await queryInterface.renameColumn('Matches', 'team2Id', 'visitorTeamId');
  },

  async down(queryInterface, Sequelize) {
    // Lógica para revertir los cambios si es necesario
    await queryInterface.renameColumn('Matches', 'localTeamId', 'team1Id');
    await queryInterface.renameColumn('Matches', 'visitorTeamId', 'team2Id');
  }
};
