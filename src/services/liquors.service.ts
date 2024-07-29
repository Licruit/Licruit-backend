import { LiquorCategory } from '../models/liquorCategories.model';

export const selectLiquorCategories = async () => {
  try {
    const liquorCategories = await LiquorCategory.findAll();

    return liquorCategories;
  } catch (err) {
    throw new Error('주류 카테고리 조회 실패');
  }
};
