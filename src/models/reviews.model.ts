import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { User } from './users.model';
import { Liquor } from './liquors.model';
import { Order } from './orders.model';

interface ReviewsAttributes {
  id?: CreationOptional<number>;
  orderId: number;
  liquorId: number;
  userCompanyNumber: string;
  score: number;
  title: string;
  content: string;
  createdAt?: CreationOptional<Date>;
}

export class Review extends Model<ReviewsAttributes> {
  public readonly id!: CreationOptional<number>;
  public orderId!: number;
  public liquorId!: number;
  public userCompanyNumber!: string;
  public score!: number;
  public title!: string;
  public content!: string;
  public createdAt!: CreationOptional<Date>;

  public static associations: {
    reviewOrderTag: Association<Order, Review>;
    reviewLiquorTag: Association<Liquor, Review>;
    reviewUserTag: Association<User, Review>;
  };
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id',
      },
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
    userCompanyNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'user_company_number',
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
    score: {
      type: DataTypes.DECIMAL(2, 1),
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
    modelName: 'Review',
    tableName: 'reviews',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Review.belongsTo(Order, {
  foreignKey: 'orderId',
});

Order.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'orderId',
});

Review.belongsTo(Liquor, {
  foreignKey: 'liquorId',
});

Liquor.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'liquorId',
});

Review.belongsTo(User, {
  foreignKey: 'userCompanyNumber',
});

User.hasMany(Review, {
  sourceKey: 'companyNumber',
  foreignKey: 'userCompanyNumber',
});
