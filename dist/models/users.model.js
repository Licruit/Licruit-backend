const Sequelize = require('sequelize');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            company_number: {
                type: Sequelize.STRING(10),
                allowNull: false,
                primaryKey: true
            },
            salt: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            business_name: {
                type: Sequelize.STRING(30),
                allowNull: false
            },
            contact: {
                type: Sequelize.STRING(11),
                allowNull: false
            },
            sector_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'sectors',
                    key: 'id'
                }
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        });
    }

    static associate(db) {
        db.User.belongsTo(db.Sector, { foreignKey: 'sector_id', targetKey: 'id' });
        db.User.hasOne(db.Wholesaler, { foreignKey: 'user_company_number', sourceKey: 'company_number' });
    }
}

module.exports = User;