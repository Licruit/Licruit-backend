import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Liquor } from './liquors.model';
import { Wholesaler } from './wholesalers.model';

interface BuyingsAttributes {
  id: number;
  open_date: CreationOptional<Date>;
  deadline: CreationOptional<Date>;
  delivery_start: CreationOptional<Date>;
  delivery_end: CreationOptional<Date>;
  total_min: number;
  total_max: number;
  individual_min: number;
  price: number;
  delivery_fee: number;
  free_delivery_fee: number;
  title: string;
  content: string;
  liquor_id: number;
  wholesaler_company_number: number;
  created_at: CreationOptional<Date>;
}

export class Buying extends Model<BuyingsAttributes> {
  public readonly id!: number;
  public open_date!: CreationOptional<Date>;
  public deadline!: CreationOptional<Date>;
  public delivery_start!: CreationOptional<Date>;
  public delivery_end!: CreationOptional<Date>;
  public total_min!: number;
  public total_max!: number;
  public individual_min!: number;
  public price!: number;
  public delivery_fee!: number;
  public free_delivery_fee!: number;
  public title!: string;
  public content!: string;
  public liquor_id!: number;
  public wholesaler_company_number!: number;
  public created_at!: CreationOptional<Date>;

  public static associations: {
    buyingLiquorTag: Association<Liquor, Buying>;
    buyingWholesalerTag: Association<Wholesaler, Buying>;
  };
}

Buying.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    open_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    delivery_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    delivery_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_max: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    individual_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery_fee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    free_delivery_fee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    liquor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'liquors',
        key: 'id',
      },
    },
    wholesaler_company_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'wholesalers',
        key: 'user_company_number',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Buying',
    tableName: 'buyings',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Buying.belongsTo(Liquor, {
  foreignKey: 'liquor_id',
});

Liquor.hasMany(Buying, {
  sourceKey: 'id',
  foreignKey: 'liquor_id',
});

Buying.belongsTo(Wholesaler, {
  foreignKey: 'wholesaler_company_number',
});

Wholesaler.hasMany(Buying, {
  sourceKey: 'user_company_number',
  foreignKey: 'wholesaler_company_number',
});
