import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface StatesAttributes {
  id: number;
  status: string;
}

export class State extends Model<StatesAttributes> {
  public readonly id!: number;
  public readonly status!: string;
}

State.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
    paranoid: false,
    modelName: 'State',
    tableName: 'states',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);
