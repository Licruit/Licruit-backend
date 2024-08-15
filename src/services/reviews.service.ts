import { ReviewDTO } from '../dto/reviews.dto';
import { Review } from '../models/reviews.model';

export const insertReview = async ({ buyingId, liquorId, companyNumber, score, title, content }: ReviewDTO) => {
  try {
    const newReview = await Review.create({
      buyingId,
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
