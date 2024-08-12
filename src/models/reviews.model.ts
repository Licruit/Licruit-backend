import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buying.model';
import { User } from './users.model';
import { Liquor } from './liquors.model';

interface ReviewsAttributes {
  id: number;
  buying_id: number;
  liquor_id: number;
  user_company_number: string;
  score: number;
  title: string;
  content: string;
  created_at: CreationOptional<Date>;
}

export class Review extends Model<ReviewsAttributes> {
  public readonly id!: number;
  public buying_id!: number;
  public liquor_id!: number;
  public user_company_number!: string;
  public score!: number;
  public title!: string;
  public content!: string;
  public created_at!: CreationOptional<Date>;

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
    buying_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'buyings',
        key: 'id',
      },
    },
    liquor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'liquors',
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
    modelName: 'Review',
    tableName: 'reviews',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Review.belongsTo(Buying, {
  foreignKey: 'buying_id',
});

Buying.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'buying_id',
});

Review.belongsTo(Liquor, {
  foreignKey: 'liquor_id',
});

Liquor.hasMany(Review, {
  sourceKey: 'id',
  foreignKey: 'liquor_id',
});

Review.belongsTo(User, {
  foreignKey: 'user_company_number',
});

User.hasMany(Review, {
  sourceKey: 'company_number',
  foreignKey: 'user_company_number',
});
