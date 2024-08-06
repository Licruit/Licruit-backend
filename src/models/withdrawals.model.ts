import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface WithdrawalsAttributes {
  company_number: string;
  reason: string;
}

export class Withdrawal extends Model<WithdrawalsAttributes> {
  public readonly company_number!: string;
  public readonly reason!: string;
}

Withdrawal.init(
  {
    company_number: {
      // 사업자 번호
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    reason: {
      // 탈퇴 사유
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    underscored: false,
    paranoid: false,
    modelName: 'Withdrawal',
    tableName: 'withdrawals',
    sequelize,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
);
