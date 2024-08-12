import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buyings.model';
import { Region } from './regions.model';

interface DeliveryRegionsAttributes {
  buyingId: number;
  regionId: number;
}

export class DeliveryRegion extends Model<DeliveryRegionsAttributes> {
  public buyingId!: number;
  public regionId!: number;

  public static associations: {
    deliveryBuyingTag: Association<Buying, DeliveryRegion>;
    deliveryRegionTag: Association<Region, DeliveryRegion>;
  };
}

DeliveryRegion.init(
  {
    buyingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'buying_id',
      references: {
        model: 'buyings',
        key: 'id',
      },
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'region_id',
      references: {
        model: 'regions',
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
    underscored: true,
    paranoid: false,
    modelName: 'DeliveryRegion',
    tableName: 'delivery_regions',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

DeliveryRegion.belongsTo(Buying, {
  foreignKey: 'buyingId',
});

Buying.hasMany(DeliveryRegion, {
  sourceKey: 'id',
  foreignKey: 'buyingId',
});

DeliveryRegion.belongsTo(Region, {
  foreignKey: 'regionId',
});

Region.hasMany(DeliveryRegion, {
  sourceKey: 'id',
  foreignKey: 'regionId',
});
