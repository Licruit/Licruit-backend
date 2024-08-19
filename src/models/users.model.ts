import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { Sector } from './sectors.model';

interface UsersAttributes {
  companyNumber: string;
  salt: string;
  password: string;
  businessName: string;
  contact: string;
  address: string;
  sectorId: number;
  img: string;
  isMarketing: boolean;
}

export class User extends Model<UsersAttributes> {
  public readonly companyNumber!: string;
  public salt!: string;
  public password!: string;
  public businessName!: string;
  public contact!: string;
  public address!: string;
  public sectorId!: number;
  public img!: string;
  public isMarketing!: boolean;

  public static associations: {
    userSectorTag: Association<Sector, User>;
  };
}

User.init(
  {
    companyNumber: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      field: 'company_number',
    },
    salt: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    businessName: {
      // 상호명
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'business_name',
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
    sectorId: {
      // 업종 코드
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sector_id',
      references: {
        model: 'sectors',
        key: 'id',
      },
    },
    img: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    isMarketing: {
      // 마케팅 활용 동의 여부
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
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
  foreignKey: 'sectorId',
});

Sector.hasMany(User, {
  sourceKey: 'id',
  foreignKey: 'sectorId',
});
