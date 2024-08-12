import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface LiquorCategoriesAttributes {
  id: number;
  name: string;
}

export class LiquorCategory extends Model<LiquorCategoriesAttributes> {
  public readonly id!: number;
  public readonly name!: string;
}

LiquorCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      // 주류 카테고리 이름
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
    paranoid: false,
    modelName: 'LiquorCategory',
    tableName: 'liquor_categories',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);
