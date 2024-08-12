import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buyings.model';
import { User } from './users.model';
import { Wholesaler } from './wholesalers.model';

interface BlacklistsAttributes {
  id: number;
  buyingId: number;
  userCompanyNumber: string;
  wholesalerCompanyNumber: string;
  createdAt: CreationOptional<Date>;
}

export class Blacklist extends Model<BlacklistsAttributes> {
  public readonly id!: number;
  public buyingId!: number;
  public userCompanyNumber!: string;
  public wholesalerCompanyNumber!: string;
  public createdAt!: CreationOptional<Date>;

  public static associations: {
    blacklistBuyingTag: Association<Buying, Blacklist>;
    blacklistUserTag: Association<User, Blacklist>;
    blacklistWholesalerTag: Association<Wholesaler, Blacklist>;
  };
}

Blacklist.init(
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
    userCompanyNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'user_company_number',
      references: {
        model: 'users',
        key: 'company_number',
      },
    },
    wholesalerCompanyNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'wholesaler_company_number',
      references: {
        model: 'wholesalers',
        key: 'user_company_number',
      },
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
    modelName: 'Blacklist',
    tableName: 'blacklists',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);

Blacklist.belongsTo(Buying, {
  foreignKey: 'buying_id',
});

Buying.hasMany(Blacklist, {
  sourceKey: 'id',
  foreignKey: 'buyingId',
});

Blacklist.belongsTo(User, {
  foreignKey: 'userCompanyNumber',
});

User.hasMany(Blacklist, {
  sourceKey: 'companyNumber',
  foreignKey: 'userCompanyNumber',
});

Blacklist.belongsTo(Wholesaler, {
  foreignKey: 'wholesalerCompanyNumber',
});

Wholesaler.hasMany(Blacklist, {
  sourceKey: 'userCompanyNumber',
  foreignKey: 'wholesalerCompanyNumber',
});
