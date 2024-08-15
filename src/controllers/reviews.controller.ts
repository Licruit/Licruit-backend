import { Request, Response } from 'express';
import { TokenRequest } from '../auth';
import { findBuying } from '../services/buyings.service';
import { ReviewInputDTO } from '../dto/reviews.dto';
import { StatusCodes } from 'http-status-codes';
import { insertReview } from '../services/reviews.service';
import HttpException from '../utils/httpExeption';

export const addReview = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const { buyingTitle, title, content, score }: ReviewInputDTO = req.body;

  const buyingInfo = await findBuying(buyingTitle);

  if (!buyingInfo) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '구매 정보가 없습니다.');
  }
  const buyingId = buyingInfo.id;
  const liquorId = buyingInfo.liquorId;

  const review = await insertReview({ buyingId, liquorId, companyNumber, score, title, content });
  return res.status(StatusCodes.CREATED).json(review);
};
