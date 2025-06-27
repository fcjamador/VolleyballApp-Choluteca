const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Sponsor = sequelize.define('Sponsor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        logoUrl: { // URL a la imagen del logo del patrocinador
            type: DataTypes.STRING(255),
            allowNull: true
        },
        websiteUrl: { // Enlace a la web del patrocinador
            type: DataTypes.STRING(255),
            allowNull: true
        },
        contactEmail: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        isActive: { // Para mostrar/ocultar patrocinadores activos
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'sponsors',
        timestamps: true
    });

    return Sponsor;
};