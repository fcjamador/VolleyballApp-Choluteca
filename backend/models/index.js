const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Importa la instancia de Sequelize

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importa y define tus modelos aquí
db.Role = require('./Role')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes);
db.Team = require('./Team')(sequelize, DataTypes);
db.Player = require('./Player')(sequelize, DataTypes);
db.Tournament = require('./Tournament')(sequelize, DataTypes); // O Liga/Torneo
db.Match = require('./Match')(sequelize, DataTypes);
db.Log = require('./Log')(sequelize, DataTypes); // Para la auditoría
db.Sponsor = require('./Sponsor')(sequelize, DataTypes); // Para los patrocinadores

// Define las relaciones entre los modelos
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;