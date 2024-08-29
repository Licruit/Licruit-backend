import { col, literal, Op } from 'sequelize';
import { AllLiquorsDTO } from '../dto/liquors.dto';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Liquor } from '../models/liquors.model';
import { Like } from '../models/likes.model';
import { Review } from '../models/reviews.model';
import { User } from '../models/users.model';
import { Buying } from '../models/buyings.model';
import { getTodayDate } from '../utils/date';

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
          [literal('(SELECT COUNT(*) FROM likes WHERE likes.liquor_id = :liquorId)'), 'likes'],
          [
            literal(
              '(SELECT COUNT(*) FROM likes WHERE likes.liquor_id = :liquorId AND user_company_number = :companyNumber)',
            ),
            'liked',
          ],
          [literal('IF(Reviews.id IS NULL, 0, COUNT(*))'), 'reviewCount'],
          [literal('ROUND(IF(AVG(Reviews.score) IS NULL, FORMAT(0.0, 1), AVG(Reviews.score)), 1)'), 'reviewAvg'],
        ],
        exclude: ['id', 'category_id'],
      },
      include: [
        {
          model: LiquorCategory,
          attributes: [],
        },
        {
          model: Review,
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
      group: 'Liquor.id',
    });

    return liquor;
  } catch (err) {
    throw new Error('전통주 상세 조회 실패');
  }
};

export const selectAllLiquors = async ({ search, category, minAlcohol, maxAlcohol, page, sort }: AllLiquorsDTO) => {
  try {
    const LIMIT = 9;
    const offset = (page! - 1) * LIMIT;
    const isSorting = sort === '0' || sort === '1';
    let whereCondition = {};
    let replacements = {};
    if (search) {
      if (isSorting) {
        whereCondition = { ...whereCondition, name: literal('Liquor.name LIKE :name') };
        replacements = { ...replacements, name: `%${search}%` };
      } else {
        whereCondition = { ...whereCondition, name: literal('MATCH(Liquor.name) AGAINST(:name IN BOOLEAN MODE)') };
        replacements = { ...replacements, name: `${search}*` };
      }
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
      attributes: [
        'id',
        'name',
        'description',
        'img',
        [col('LiquorCategory.name'), 'categoryName'],
        [
          literal(
            `(SELECT FORMAT(IFNULL(AVG(reviews.score), 0.0), 1) FROM reviews WHERE Liquor.id = reviews.liquor_id)`,
          ),
          'reviewAvg',
        ],
      ],
      include: [
        {
          model: LiquorCategory,
          attributes: [],
        },
      ],
      where: whereCondition,
      replacements: replacements,
      order: isSorting
        ? [
            ['reviewAvg', +sort ? 'asc' : 'desc'],
            ['id', 'asc'],
          ]
        : [['id', 'asc']],
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
        liquorId: liquorId,
        userCompanyNumber: companyNumber,
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
      liquorId: liquorId,
      userCompanyNumber: companyNumber,
    });
  } catch (err) {
    throw new Error('좋아요 실패');
  }
};

export const deleteLike = async (liquorId: number, companyNumber: string) => {
  try {
    await Like.destroy({
      where: {
        liquorId: liquorId,
        userCompanyNumber: companyNumber,
      },
    });
  } catch (err) {
    throw new Error('좋아요 취소 실패');
  }
};

export const selectLiquorReviews = async (liquorId: number, page: number, sort: string | undefined) => {
  try {
    const LIMIT = 5;
    const offset = (page - 1) * LIMIT;

    const reviews = await Review.findAndCountAll({
      attributes: [
        [col('User.img'), 'img'],
        [col('User.business_name'), 'name'],
        'userCompanyNumber',
        'content',
        'score',
        'createdAt',
      ],
      include: [
        {
          model: User,
          attributes: [],
        },
      ],
      where: {
        liquorId: liquorId,
      },
      order: [['score', sort === '1' ? 'asc' : 'desc']],
      limit: LIMIT,
      offset: offset,
    });

    const reviewsAndPagination = {
      reviews: reviews.rows,
      pagination: {
        currentPage: +page,
        totalPage: Math.ceil(reviews.count / LIMIT),
      },
    };

    return reviewsAndPagination;
  } catch (err) {
    throw new Error('리뷰 목록 조회 실패');
  }
};

export const selectLiquorOngoingBuyings = async (liquorId: number) => {
  try {
    const todayDateTime = getTodayDate('YYYY-MM-DD HH:mm:ss');
    const todayDate = todayDateTime.substring(0, 10);

    const buyings = await Buying.findAll({
      attributes: [
        'id',
        [literal('DATEDIFF(deadline, :todayDate)'), 'leftDate'],
        ['title', 'buyingTitle'],
        ['content', 'buyingContent'],
      ],
      where: literal(
        `liquor_id = :liquorId AND CONCAT(open_date, ' ', open_time) <= :todayDateTime AND deadline >= :todayDate`,
      ),
      replacements: {
        liquorId,
        todayDateTime,
        todayDate,
      },
    });

    return buyings;
  } catch (err) {
    throw new Error('해당 주류의 진행 중인 공동구매 목록 조회 실패');
  }
};

export const selectNewLiquors = async () => {
  try {
    const newLiquors = await Liquor.findAll({
      attributes: ['id', [col('LiquorCategory.name'), 'categoryName'], 'name', 'description', 'img'],
      include: [
        {
          model: LiquorCategory,
          attributes: [],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 3,
    });

    return newLiquors;
  } catch (err) {
    throw new Error('최신 주류 조회 실패');
  }
};
