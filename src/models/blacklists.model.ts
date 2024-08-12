import { Association, CreationOptional, DataTypes, literal, Model } from 'sequelize';
import { sequelize } from './index';
import { Buying } from './buying.model';
import { User } from './users.model';
import { Wholesaler } from './wholesalers.model';

interface BlacklistsAttributes {
  id: number;
  buying_id: number;
  user_company_number: string;
  wholesaler_company_number: string;
  created_at: CreationOptional<Date>;
}

export class Blacklist extends Model<BlacklistsAttributes> {
  public readonly id!: number;
  public buying_id!: number;
  public user_company_number!: string;
  public wholesaler_company_number!: string;
  public created_at!: CreationOptional<Date>;

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
    wholesaler_company_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'wholesalers',
        key: 'user_company_number',
      },
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
  foreignKey: 'buying_id',
});

Blacklist.belongsTo(User, {
  foreignKey: 'user_company_number',
});

User.hasMany(Blacklist, {
  sourceKey: 'company_number',
  foreignKey: 'user_company_number',
});

Blacklist.belongsTo(Wholesaler, {
  foreignKey: 'wholesaler_company_number',
});

Wholesaler.hasMany(Blacklist, {
  sourceKey: 'user_company_number',
  foreignKey: 'wholesaler_company_number',
});
