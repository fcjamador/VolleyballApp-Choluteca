'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear la tabla para los grupos del torneo
    await queryInterface.createTable('TournamentGroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tournamentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tournaments', // Asegúrate que el nombre de tu tabla de torneos sea 'Tournaments'
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false // Por ejemplo: "Grupo A", "Grupo B"
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

    // La columna 'groupId' ya no se añade aquí porque ya existe.
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios en orden inverso
    await queryInterface.dropTable('TournamentGroups');
    // La columna 'groupId' no se elimina aquí porque no fue creada por esta migración.
  }
};
