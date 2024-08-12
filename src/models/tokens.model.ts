import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { User } from './users.model';

interface TokensAttributes {
  userCompanyNumber: string;
  tokenType: string;
  token: string;
}

export class Token extends Model<TokensAttributes> {
  public readonly userCompanyNumber!: string;
  public readonly tokenType!: string;
  public token!: string;

  public static associations: {
    tokenUserTag: Association<User, Token>;
  };
}

Token.init(
  {
    userCompanyNumber: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      field: 'user_company_number',
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
    tokenType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      field: 'token_type',
    },
    token: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
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
  foreignKey: 'userCompanyNumber',
  as: 'tokenUserTag',
});

User.hasOne(Token, {
  sourceKey: 'companyNumber',
  foreignKey: 'userCompanyNumber',
  as: 'tokenUserTag',
});
