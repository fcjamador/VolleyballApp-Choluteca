'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añade la columna 'coachName' a la tabla 'Teams'
    await queryInterface.addColumn('Teams', 'coachName', {
      type: Sequelize.STRING(100),
      allowNull: true, // Permite que sea opcional
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina la columna 'coachName' si se revierte la migración
    await queryInterface.removeColumn('Teams', 'coachName');
  }
};
