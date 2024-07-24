import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "./index";
import { User } from "./users.model";

interface TokensAttributes {
    user_company_number: string;
    refresh_token: string;
}

export class Token extends Model<TokensAttributes> {
    public readonly user_company_number!: string;
    public refresh_token!: string;

    public static associations: {
        tokenUserTag: Association<User, Token>;
    };
}

Token.init({
    user_company_number: { // 사업자 번호
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'company_number'
        }
    },
    refresh_token: {
        type: DataTypes.STRING(188),
        allowNull: false
    }
}, {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Token',
    tableName: 'tokens',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
});

Token.belongsTo(User, {
    foreignKey: 'user_company_number',
    as: 'tokenUserTag'
});

User.hasOne(Token, {
    sourceKey: 'company_number',
    foreignKey: 'user_company_number',
    as: 'tokenUserTag'
});