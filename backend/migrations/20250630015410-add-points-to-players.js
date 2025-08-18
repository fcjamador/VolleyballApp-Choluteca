'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añade la columna 'points' a la tabla 'Players'
    await queryInterface.addColumn('Players', 'points', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // Los jugadores empiezan con 0 puntos
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina la columna 'points' si se revierte la migración
    await queryInterface.removeColumn('Players', 'points');
  }
};
