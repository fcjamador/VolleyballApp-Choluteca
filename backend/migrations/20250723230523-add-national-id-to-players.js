'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Players', 'nationalId', {
      type: Sequelize.STRING(20), // Suficiente para DNI y otros formatos
      allowNull: false,
      unique: true, // La base de datos forzará que este campo sea único
      // Lo añadimos después de 'lastName' para un orden lógico
      after: 'lastName'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Players', 'nationalId');
  }
};
