import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { User } from './users.model';

interface TokensAttributes {
  user_company_number: string;
  token_type: string;
  token: string;
}

export class Token extends Model<TokensAttributes> {
  public readonly user_company_number!: string;
  public readonly token_type!: string;
  public token!: string;

  public static associations: {
    tokenUserTag: Association<User, Token>;
  };
}

Token.init(
  {
    user_company_number: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
    token_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Token',
    tableName: 'tokens',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Token.belongsTo(User, {
  foreignKey: 'user_company_number',
  as: 'tokenUserTag',
});

User.hasOne(Token, {
  sourceKey: 'company_number',
  foreignKey: 'user_company_number',
  as: 'tokenUserTag',
});
