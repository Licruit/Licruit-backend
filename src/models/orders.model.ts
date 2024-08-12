import { Association, CreationOptional, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buying.model';
import { User } from './users.model';
import { State } from './states.model';

interface OrdersAttributes {
  id: number;
  buying_id: number;
  user_company_number: string;
  quantity: number;
  state_id: number;
  updated_at: CreationOptional<Date>;
}

export class Order extends Model<OrdersAttributes> {
  public readonly id!: number;
  public buying_id!: number;
  public user_company_number!: string;
  public quantity!: number;
  public state_id!: number;
  public updated_at!: CreationOptional<Date>;

  public static associations: {
    orderBuyingTag: Association<Buying, Order>;
    orderUserTag: Association<User, Order>;
  };
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    buying_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'buyings',
        key: 'id',
      },
    },
    user_company_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id',
      },
    },
    updated_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Order',
    tableName: 'orders',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Order.belongsTo(Buying, {
  foreignKey: 'buying_id',
});

Buying.hasMany(Order, {
  sourceKey: 'id',
  foreignKey: 'buying_id',
});

Order.belongsTo(User, {
  foreignKey: 'user_company_number',
});

User.hasMany(Order, {
  sourceKey: 'company_number',
  foreignKey: 'user_company_number',
});

Order.belongsTo(State, {
  foreignKey: 'state_id',
});

State.hasMany(Order, {
  sourceKey: 'id',
  foreignKey: 'state_id',
});
