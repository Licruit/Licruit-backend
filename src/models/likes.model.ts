import { Association, DataTypes, Model } from 'sequelize';
import { sequelize } from './index';
import { User } from './users.model';
import { Liquor } from './liquors.model';

interface LikesAttributes {
  liquorId: number;
  userCompanyNumber: string;
}

export class Like extends Model<LikesAttributes> {
  public readonly liquorId!: number;
  public readonly userCompanyNumber!: string;

  public static associations: {
    likeLiquorTag: Association<Liquor, Like>;
    likeUserTag: Association<User, Like>;
  };
}

Like.init(
  {
    liquorId: {
      // 주류 번호
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'liquor_id',
      references: {
        model: 'liquors',
        key: 'id',
      },
    },
    userCompanyNumber: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      field: 'user_company_number',
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
  },
  {
    timestamps: false,
    underscored: true,
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
  foreignKey: 'liquorId',
});

Liquor.hasMany(Like, {
  sourceKey: 'id',
  foreignKey: 'liquorId',
});

Like.belongsTo(User, {
  foreignKey: 'userCompanyNumber',
});

User.hasMany(Like, {
  sourceKey: 'companyNumber',
  foreignKey: 'userCompanyNumber',
});
