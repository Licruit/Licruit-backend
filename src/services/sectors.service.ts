import { Op } from 'sequelize';
import { Sector } from '../models/sectors.model';

export const selectSectors = async () => {
  try {
    const sectors = await Sector.findAll({
      where: { id: { [Op.ne]: 8 } },
      order: [['id', 'asc']],
    });

    return sectors;
  } catch (err) {
    throw new Error('업종 조회 실패');
  }
};
