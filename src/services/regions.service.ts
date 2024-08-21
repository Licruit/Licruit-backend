import { Region } from '../models/regions.model';

export const selectRegions = async () => {
  try {
    const regions = await Region.findAll({});

    return regions;
  } catch (err) {
    throw new Error('지역 목록 조회 실패');
  }
};
