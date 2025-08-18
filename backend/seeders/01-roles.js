'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'Superadmin',
        description: 'Tiene todos los permisos en el sistema.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { name: 'Admin', description: 'Puede gestionar torneos, equipos y partidos.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Normal', description: 'Usuario con permisos de solo lectura.', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};