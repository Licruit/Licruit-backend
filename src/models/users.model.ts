import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { Sector } from './sectors.model';

interface UsersAttributes {
  company_number: string;
  salt: string;
  password: string;
  business_name: string;
  contact: string;
  address: string;
  sector_id: number;
  img: string;
}

export class User extends Model<UsersAttributes> {
  public readonly company_number!: string;
  public salt!: string;
  public password!: string;
  public business_name!: string;
  public contact!: string;
  public address!: string;
  public sector_id!: number;
  public img!: string;

  public static associations: {
    userSectorTag: Association<Sector, User>;
  };
}

User.init(
  {
    company_number: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    salt: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    business_name: {
      // 상호명
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    contact: {
      // 연락처
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sector_id: {
      // 업종 코드
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sectors',
        key: 'id',
      },
    },
    img: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'User',
    tableName: 'users',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

User.belongsTo(Sector, {
  foreignKey: 'sector_id',
});

Sector.hasMany(User, {
  sourceKey: 'id',
  foreignKey: 'sector_id',
});
