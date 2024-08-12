import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buying.model';
import { Region } from './regions.model';

interface DeliveryRegionsAttributes {
  buying_id: number;
  region_id: number;
}

export class DeliveryRegion extends Model<DeliveryRegionsAttributes> {
  public buying_id!: number;
  public region_id!: number;

  public static associations: {
    deliveryBuyingTag: Association<Buying, DeliveryRegion>;
    deliveryRegionTag: Association<Region, DeliveryRegion>;
  };
}

DeliveryRegion.init(
  {
    buying_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'buyings',
        key: 'id',
      },
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'regions',
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
    underscored: false,
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
  foreignKey: 'buying_id',
});

Buying.hasMany(DeliveryRegion, {
  sourceKey: 'id',
  foreignKey: 'buying_id',
});

DeliveryRegion.belongsTo(Region, {
  foreignKey: 'region_id',
});

Region.hasMany(DeliveryRegion, {
  sourceKey: 'id',
  foreignKey: 'region_id',
});
