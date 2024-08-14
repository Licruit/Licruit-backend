import { Association, CreationOptional, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buyings.model';
import { User } from './users.model';
import { State } from './states.model';

interface OrdersAttributes {
  buyingId: number;
  userCompanyNumber: string;
  quantity: number;
  stateId: number;
  updatedAt: CreationOptional<Date>;
}

export class Order extends Model<OrdersAttributes> {
  public buyingId!: number;
  public userCompanyNumber!: string;
  public quantity!: number;
  public stateId!: number;
  public updatedAt!: CreationOptional<Date>;

  public static associations: {
    orderBuyingTag: Association<Buying, Order>;
    orderUserTag: Association<User, Order>;
  };
}

Order.init(
  {
    buyingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'buying_id',
      references: {
        model: 'buyings',
        key: 'id',
      },
    },
    userCompanyNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'user_company_number',
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'state_id',
      references: {
        model: 'states',
        key: 'id',
      },
    },
    updatedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    timestamps: false,
    underscored: true,
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
  foreignKey: 'buyingId',
});

Buying.hasMany(Order, {
  sourceKey: 'id',
  foreignKey: 'buyingId',
});

Order.belongsTo(User, {
  foreignKey: 'userCompanyNumber',
});

User.hasMany(Order, {
  sourceKey: 'companyNumber',
  foreignKey: 'userCompanyNumber',
});

Order.belongsTo(State, {
  foreignKey: 'stateId',
});

State.hasMany(Order, {
  sourceKey: 'id',
  foreignKey: 'stateId',
});
