import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { User } from './users.model';

interface WholesalersAttributes {
  userCompanyNumber: string;
  homepage?: string;
  introduce?: string;
}

export class Wholesaler extends Model<WholesalersAttributes> {
  public userCompanyNumber!: string;
  public homepage!: string;
  public introduce!: string;

  public static associations: {
    wholesalerUserTag: Association<User, Wholesaler>;
  };
}

Wholesaler.init(
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
    homepage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    introduce: {
      // 소개글
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    underscored: true,
    paranoid: false,
    modelName: 'Wholesaler',
    tableName: 'wholesalers',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Wholesaler.belongsTo(User, {
  foreignKey: 'userCompanyNumber',
});

User.hasOne(Wholesaler, {
  sourceKey: 'companyNumber',
  foreignKey: 'userCompanyNumber',
});
