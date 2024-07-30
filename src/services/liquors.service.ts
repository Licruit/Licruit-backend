import { col, literal, Op } from 'sequelize';
import { AllLiquorsDTO } from '../dto/liquors.dto';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Liquor } from '../models/liquors.model';

export const selectLiquorCategories = async () => {
  try {
    const liquorCategories = await LiquorCategory.findAll();

    return liquorCategories;
  } catch (err) {
    throw new Error('주류 카테고리 조회 실패');
  }
};

export const selectAllLiquors = async ({ search, category, min_alcohol, max_alcohol, page }: AllLiquorsDTO) => {
  try {
    const LIMIT = 9;
    const offset = (page! - 1) * LIMIT;
    let whereCondition = {};
    let replacements = {};
    if (search) {
      whereCondition = { ...whereCondition, name: literal('MATCH(Liquor.name) AGAINST(:name IN BOOLEAN MODE)') };
      replacements = { ...replacements, name: `*${search}*` };
    }
    if (category) {
      whereCondition = { ...whereCondition, category_id: category };
    }
    if (min_alcohol && max_alcohol) {
      whereCondition = {
        ...whereCondition,
        alcohol: {
          [Op.between]: [min_alcohol, max_alcohol],
        },
      };
    }

    const liquors = await Liquor.findAndCountAll({
      attributes: [
        ['name', 'name'],
        ['description', 'description'],
        [col('LiquorCategory.name'), 'category_name'],
      ],
      include: [
        {
          model: LiquorCategory,
          attributes: [],
        },
      ],
      where: whereCondition,
      replacements: replacements,
      limit: LIMIT,
      offset: offset,
    });

    const liquorsAndPagination = {
      liquors: liquors.rows,
      pagination: {
        currentPage: +page!,
        totalPage: Math.ceil(liquors.count / LIMIT),
      },
    };

    return liquorsAndPagination;
  } catch (err) {
    throw new Error('주류 카탈로그 목록 조회 실패');
  }
};
