'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Añadir la columna para el número de sets a la tabla de Partidos
    await queryInterface.addColumn('Matches', 'numberOfSets', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 3, // Por defecto, los partidos serán a 3 sets
    });

    // 2. Crear la nueva tabla para guardar los marcadores de cada set
    await queryInterface.createTable('SetScores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      matchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Matches', key: 'id' },
        onDelete: 'CASCADE' // Si se borra un partido, se borran sus marcadores
      },
      setNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      team1Score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      team2Score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Añadir una restricción para asegurar que no haya sets duplicados para un mismo partido
    await queryInterface.addConstraint('SetScores', {
      fields: ['matchId', 'setNumber'],
      type: 'unique',
      name: 'unique_set_per_match'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revierte los cambios en orden inverso si es necesario
    await queryInterface.dropTable('SetScores');
    await queryInterface.removeColumn('Matches', 'numberOfSets');
  }
};
