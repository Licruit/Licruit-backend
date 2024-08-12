import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface RegionsAttributes {
  id: number;
  name: string;
}

export class Region extends Model<RegionsAttributes> {
  public readonly id!: number;
  public readonly name!: string;
}

Region.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      // 지역 이름
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
    paranoid: false,
    modelName: 'Region',
    tableName: 'regions',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);
