import { col, literal, Op } from 'sequelize';
import { AllLiquorsDTO } from '../dto/liquors.dto';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Liquor } from '../models/liquors.model';
import { Like } from '../models/likes.model';

export const selectLiquorCategories = async () => {
  try {
    const liquorCategories = await LiquorCategory.findAll();

    return liquorCategories;
  } catch (err) {
    throw new Error('주류 카테고리 조회 실패');
  }
};

export const selectLiquor = async (liquorId: number) => {
  try {
    const liquor = await Liquor.findOne({
      where: { id: liquorId },
    });

    return liquor;
  } catch (err) {
    throw new Error('전통주 조회 실패');
  }
};

export const selectLiquorDetail = async (liquorId: number, companyNumber: string | null) => {
  try {
    const liquor = await Liquor.findOne({
      attributes: {
        include: [
          [col('LiquorCategory.name'), 'categoryName'],
          [literal('COUNT(*)'), 'likes'],
          [
            literal(
              '(SELECT COUNT(*) FROM likes WHERE likes.liquor_id = :liquorId AND user_company_number = :companyNumber)',
            ),
            'liked',
          ],
        ],
        exclude: ['id', 'category_id'],
      },
      include: [
        {
          model: Like,
          attributes: [],
        },
        {
          model: LiquorCategory,
          attributes: [],
        },
      ],
      where: {
        id: liquorId,
      },
      replacements: {
        liquorId: liquorId,
        companyNumber: companyNumber || '',
      },
    });

    return liquor;
  } catch (err) {
    throw new Error('전통주 상세 조회 실패');
  }
};

export const selectAllLiquors = async ({ search, category, minAlcohol, maxAlcohol, page }: AllLiquorsDTO) => {
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
    if (minAlcohol && maxAlcohol) {
      whereCondition = {
        ...whereCondition,
        alcohol: {
          [Op.between]: [minAlcohol, maxAlcohol],
        },
      };
    }

    const liquors = await Liquor.findAndCountAll({
      attributes: ['id', 'name', 'description', 'img', [col('LiquorCategory.name'), 'categoryName']],
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

export const selectLike = async (liquorId: number, companyNumber: string) => {
  try {
    const isLiked = await Like.findOne({
      where: {
        liquor_id: liquorId,
        user_company_number: companyNumber,
      },
    });

    return isLiked;
  } catch (err) {
    throw new Error('좋아요 조회 실패');
  }
};

export const insertLike = async (liquorId: number, companyNumber: string) => {
  try {
    await Like.create({
      liquor_id: liquorId,
      user_company_number: companyNumber,
    });
  } catch (err) {
    throw new Error('좋아요 실패');
  }
};

export const deleteLike = async (liquorId: number, companyNumber: string) => {
  try {
    await Like.destroy({
      where: {
        liquor_id: liquorId,
        user_company_number: companyNumber,
      },
    });
  } catch (err) {
    throw new Error('좋아요 취소 실패');
  }
};
