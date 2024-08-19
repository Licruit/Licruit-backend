import { Request, Response } from 'express';
import { TokenRequest } from '../auth';
import { findBuying } from '../services/buyings.service';
import { ReviewInputDTO } from '../dto/reviews.dto';
import { StatusCodes } from 'http-status-codes';
import { insertReview } from '../services/reviews.service';
import HttpException from '../utils/httpExeption';
import { findOrder } from '../services/orders.service';

export const addReview = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const { orderId, title, content, score }: ReviewInputDTO = req.body;

  const order = await findOrder(orderId);
  if (!order) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '구매 정보가 없습니다.');
  }
  const buying = await findBuying(order.buyingId);
  if (!buying) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '해당 주문의 공동구매 정보가 없습니다.');
  }
  const liquorId = buying.liquorId;

  const review = await insertReview({ orderId, liquorId, companyNumber, score, title, content });
  return res.status(StatusCodes.CREATED).json(review);
};
