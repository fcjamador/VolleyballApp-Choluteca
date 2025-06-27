const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        coachName: { // Nombre del entrenador
            type: DataTypes.STRING(100),
            allowNull: true
        },
        // La asociación con el usuario que lo creó (opcional, pero útil)
        // createdByUserId: DataTypes.INTEGER
    }, {
        tableName: 'teams',
        timestamps: true // Para createdAt y updatedAt
    });

    Team.associate = (models) => {
        // Un equipo puede tener muchos jugadores
        Team.hasMany(models.Player, {
            foreignKey: 'teamId',
            as: 'players'
        });
        // Opcional: Si quieres registrar qué usuario creó el equipo
        // Team.belongsTo(models.User, {
        //     foreignKey: 'createdByUserId',
        //     as: 'creator'
        // });
    };

    return Team;
};