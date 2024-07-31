import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { LiquorCategory } from './liquorCategories.model';

interface LiquorsAttributes {
  id: number;
  name: string;
  img: string;
  category_id: number;
  ingredient?: string;
  alcohol: number;
  volume: number;
  award?: string;
  etc?: string;
  description?: string;
  food?: string;
  brewery?: string;
  address?: string;
  homepage?: string;
  contact?: string;
}

export class Liquor extends Model<LiquorsAttributes> {
  public readonly id!: number;
  public name!: string;
  public img!: string;
  public category_id!: number;
  public ingredient!: string | null;
  public alcohol!: number;
  public volume!: number;
  public award!: string | null;
  public etc!: string | null;
  public description!: string | null;
  public food!: string | null;
  public brewery!: string | null;
  public address!: string | null;
  public homepage!: string | null;
  public contact!: string | null;

  public static associations: {
    liquorCategoryTag: Association<LiquorCategory, Liquor>;
  };
}

Liquor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      // 주류 이름
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    img: {
      // 이미지 url
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    category_id: {
      // 주류 카테고리 id
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'liquor_categories',
        key: 'id',
      },
    },
    ingredient: {
      // 원재료
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alcohol: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    volume: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    award: {
      // 수상 내역
      type: DataTypes.TEXT,
      allowNull: true,
    },
    etc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    food: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    brewery: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    homepage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Liquor',
    tableName: 'liquors',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    indexes: [
      {
        type: 'FULLTEXT',
        fields: ['name'],
      },
    ],
  },
);

Liquor.belongsTo(LiquorCategory, {
  foreignKey: 'category_id',
  // as: 'liquorCategoryTag',
});

LiquorCategory.hasMany(Liquor, {
  sourceKey: 'id',
  foreignKey: 'category_id',
  // as: 'liquorCategoryTag',
});
