import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface WithdrawalsAttributes {
  reason: string;
}

export class Withdrawal extends Model<WithdrawalsAttributes> {
  public readonly reason!: string;
}

Withdrawal.init(
  {
    reason: {
      // 탈퇴 사유
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: true,
    paranoid: false,
    modelName: 'Withdrawal',
    tableName: 'withdrawals',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);
