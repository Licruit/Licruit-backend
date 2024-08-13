import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Liquor } from './liquors.model';
import { Wholesaler } from './wholesalers.model';

interface BuyingsAttributes {
  id?: CreationOptional<number>;
  openDate: CreationOptional<Date>;
  deadline: CreationOptional<Date>;
  openTime: CreationOptional<string>;
  deliveryStart: CreationOptional<Date>;
  deliveryEnd: CreationOptional<Date>;
  totalMin: number;
  totalMax: number;
  individualMin: number;
  price: number;
  deliveryFee: number;
  freeDeliveryFee: number;
  title: string;
  content: string;
  liquorId: number;
  wholesalerCompanyNumber: string;
  createdAt: CreationOptional<Date>;
}

export class Buying extends Model<BuyingsAttributes> {
  public readonly id!: CreationOptional<number>;
  public openDate!: CreationOptional<Date>;
  public deadline!: CreationOptional<Date>;
  public openTime!: CreationOptional<string>;
  public deliveryStart!: CreationOptional<Date>;
  public deliveryEnd!: CreationOptional<Date>;
  public totalMin!: number;
  public totalMax!: number;
  public individualMin!: number;
  public price!: number;
  public deliveryFee!: number;
  public freeDeliveryFee!: number;
  public title!: string;
  public content!: string;
  public liquorId!: number;
  public wholesalerCompanyNumber!: string;
  public createdAt!: CreationOptional<Date>;

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
    openDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'open_date',
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    openTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'open_time',
    },
    deliveryStart: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'delivery_start',
    },
    deliveryEnd: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'delivery_end',
    },
    totalMin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_min',
    },
    totalMax: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_max',
    },
    individualMin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'individual_min',
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryFee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'delivery_fee',
    },
    freeDeliveryFee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'free_delivery_fee',
    },
    title: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    liquorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'liquor_id',
      references: {
        model: 'liquors',
        key: 'id',
      },
    },
    wholesalerCompanyNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'wholesaler_company_number',
      references: {
        model: 'wholesalers',
        key: 'user_company_number',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    timestamps: false,
    underscored: true,
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
  foreignKey: 'liquorId',
});

Liquor.hasMany(Buying, {
  sourceKey: 'id',
  foreignKey: 'liquorId',
});

Buying.belongsTo(Wholesaler, {
  foreignKey: 'wholesalerCompanyNumber',
});

Wholesaler.hasMany(Buying, {
  sourceKey: 'userCompanyNumber',
  foreignKey: 'wholesalerCompanyNumber',
});
