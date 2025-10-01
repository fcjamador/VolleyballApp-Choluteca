const { Sequelize } = require('sequelize');
const config = require('./config'); // Importamos la configuración centralizada

// Usamos la configuración del entorno actual (development, production, etc.)
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.use_env_variable
  ? new Sequelize(process.env[dbConfig.use_env_variable], dbConfig)
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

module.exports = { sequelize };