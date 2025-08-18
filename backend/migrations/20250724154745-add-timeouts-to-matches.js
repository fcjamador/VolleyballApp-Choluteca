'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Matches', 'localTeamTimeouts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 2, // Cada equipo empieza con 2 tiempos fuera
    });
    await queryInterface.addColumn('Matches', 'visitorTeamTimeouts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 2,
    });
    await queryInterface.addColumn('Matches', 'timeoutActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Matches', 'timeoutTeamId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nulo si no hay tiempo fuera activo
    });
    await queryInterface.addColumn('Matches', 'timeoutStartTime', {
      type: Sequelize.DATE,
      allowNull: true, // Nulo si no hay tiempo fuera activo
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Matches', 'localTeamTimeouts');
    await queryInterface.removeColumn('Matches', 'visitorTeamTimeouts');
    await queryInterface.removeColumn('Matches', 'timeoutActive');
    await queryInterface.removeColumn('Matches', 'timeoutTeamId');
    await queryInterface.removeColumn('Matches', 'timeoutStartTime');
  }
};
