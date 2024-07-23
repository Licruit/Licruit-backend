const Sequelize = require('sequelize');

class Wholesaler extends Sequelize.Model {
    static initiate(sequelize) {
        Wholesaler.init({
            user_company_number: {
                type: Sequelize.STRING(10),
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'users',
                    key: 'company_number'
                }
            },
            homepage: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            introduce: {
                type: Sequelize.STRING(200),
                allowNull: true
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Wholesaler',
            tableName: 'wholesalers',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        });
    }

    static associate(db) {
        db.Wholesaler.belongsTo(db.User, { foreignKey: 'user_company_number', targetKey: 'company_number' });
    }
}

module.exports = Wholesaler;