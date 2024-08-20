import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buyings.model';
import { User } from './users.model';
import { State } from './states.model';

export interface OrdersAttributes {
  id?: CreationOptional<number>;
  buyingId: number;
  userCompanyNumber: string;
  quantity: number;
  stateId: number;
  updatedAt: CreationOptional<Date>;
  createdAt?: CreationOptional<Date>;
}

export class Order extends Model<OrdersAttributes> {
  public readonly id!: CreationOptional<number>;
  public buyingId!: number;
  public userCompanyNumber!: string;
  public quantity!: number;
  public stateId!: number;
  public updatedAt!: CreationOptional<Date>;
  public createdAt!: CreationOptional<Date>;

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
      autoIncrement: true,
    },
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
