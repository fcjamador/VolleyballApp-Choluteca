const { Sequelize } = require('sequelize');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres', // Especifica que estamos usando PostgreSQL
        logging: false, // Puedes cambiar a true para ver las consultas SQL en la consola
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Función para probar la conexión
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1); // Salir del proceso si no se puede conectar
    }
};

module.exports = { sequelize, connectDB };