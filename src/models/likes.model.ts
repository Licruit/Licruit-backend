import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { User } from './users.model';
import { Liquor } from './liquors.model';

interface LikesAttributes {
  liquor_id: number;
  user_company_number: string;
}

export class Like extends Model<LikesAttributes> {
  public readonly liquor_id!: number;
  public readonly user_company_number!: string;

  public static associations: {
    likeLiquorTag: Association<Liquor, Like>;
    likeUserTag: Association<User, Like>;
  };
}

Like.init(
  {
    liquor_id: {
      // 주류 번호
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'liquors',
        key: 'id',
      },
    },
    user_company_number: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Like',
    tableName: 'likes',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Like.belongsTo(Liquor, {
  foreignKey: 'liquor_id',
  // as: 'likeLiquorTag',
});

Liquor.hasMany(Like, {
  sourceKey: 'id',
  foreignKey: 'liquor_id',
  // as: 'likeLiquorTag',
});

Like.belongsTo(User, {
  foreignKey: 'user_company_number',
  // as: 'likeUserTag',
});

User.hasMany(Like, {
  sourceKey: 'company_number',
  foreignKey: 'user_company_number',
  // as: 'likeUserTag',
});
