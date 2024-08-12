import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buyings.model';
import { User } from './users.model';
import { Liquor } from './liquors.model';

interface ReviewsAttributes {
  id: number;
  buyingId: number;
  liquorId: number;
  userCompanyNumber: string;
  score: number;
  title: string;
  content: string;
  createdAt: CreationOptional<Date>;
}

export class Review extends Model<ReviewsAttributes> {
  public readonly id!: number;
  public buyingId!: number;
  public liquorId!: number;
  public userCompanyNumber!: string;
  public score!: number;
  public title!: string;
  public content!: string;
  public createdAt!: CreationOptional<Date>;

  public static associations: {
    reviewBuyingTag: Association<Buying, Review>;
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

Review.belongsTo(Buying, {
  foreignKey: 'buyingId',
});

Buying.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'buyingId',
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
