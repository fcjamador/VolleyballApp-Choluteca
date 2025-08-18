'use strict';
const bcrypt = require('bcryptjs');
require('dotenv').config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Usamos una consulta más estándar para obtener el rol. Es más explícito.
    const roles = await queryInterface.sequelize.query(
      `SELECT id from Roles WHERE name = 'Superadmin' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!roles || roles.length === 0) {
      throw new Error('El rol de Superadmin no se encontró. Asegúrate de que el seeder de roles se haya ejecutado primero.');
    }

    const superadminRoleId = roles[0].id;

    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_SUPERADMIN_PASSWORD, 10);

    await queryInterface.bulkInsert('Users', [{
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      roleId: superadminRoleId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: 'superadmin@example.com'
    }, {});
  }
};