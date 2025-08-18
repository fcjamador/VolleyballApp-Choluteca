'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añadir la columna 'location'
    await queryInterface.addColumn('Tournaments', 'location', {
      type: Sequelize.STRING,
      allowNull: true, // O false si quieres que sea obligatorio
    });

    // Añadir la columna 'status'
    await queryInterface.addColumn('Tournaments', 'status', {
      type: Sequelize.ENUM('Programado', 'Activo', 'Completado', 'Cancelado'),
      defaultValue: 'Programado',
      allowNull: false,
    });

    // Añadir la columna 'type'
    await queryInterface.addColumn('Tournaments', 'type', {
      type: Sequelize.ENUM('League', 'Knockout', 'Group Stage'),
      defaultValue: 'League',
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina las columnas si se revierte la migración
    await queryInterface.removeColumn('Tournaments', 'location');
    await queryInterface.removeColumn('Tournaments', 'status');
    await queryInterface.removeColumn('Tournaments', 'type');
  }
};
