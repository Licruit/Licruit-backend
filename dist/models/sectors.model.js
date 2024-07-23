const Sequelize = require('sequelize');

class Sector extends Sequelize.Model {
    static initiate(sequelize) {
        Sector.init({
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(10),
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Sector',
            tableName: 'sectors',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        })
    }

    static associate(db) {
        db.Sector.hasMany(db.User, { foreignKey: 'id', sourceKey: 'id' });
    }
}

module.exports = Sector;