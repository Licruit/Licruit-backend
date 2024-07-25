import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface SectorsAttributes {
  id: number;
  name: string;
}

export class Sector extends Model<SectorsAttributes> {
  public readonly id!: number;
  public readonly name!: string;

  public static associations: {};
}

Sector.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      // 업종 이름
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Sector',
    tableName: 'sectors',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);
