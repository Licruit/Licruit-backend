import { col } from 'sequelize';
import { ReviewDTO } from '../dto/reviews.dto';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Liquor } from '../models/liquors.model';
import { Review } from '../models/reviews.model';

export const insertReview = async ({ orderId, liquorId, companyNumber, score, title, content }: ReviewDTO) => {
  try {
    const newReview = await Review.create({
      orderId,
      liquorId,
      userCompanyNumber: companyNumber,
      score,
      title,
      content,
    });

    return newReview;
  } catch (err) {
    throw new Error('리뷰 작성 실패');
  }
};

export const selectReviews = async (page: number) => {
  try {
    const LIMIT = 5;
    const offset = (page - 1) * LIMIT;

    const reviews = await Review.findAndCountAll({
      attributes: [
        'score',
        [col('Liquor.img'), 'img'],
        [col('Liquor->LiquorCategory.name'), 'categoryName'],
        [col('Liquor.name'), 'liquorName'],
        'content',
      ],
      include: [
        {
          model: Liquor,
          attributes: [],
          include: [
            {
              model: LiquorCategory,
              attributes: [],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: LIMIT,
      offset: offset,
      subQuery: false,
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
    throw new Error('리뷰 조회 실패');
  }
};
