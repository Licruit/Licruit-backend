import { Request, Response } from 'express';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';
import { TokenRequest } from '../auth';
import { selectWholesaler } from '../services/users.service';
import { addBuying } from '../services/buyings.service';
import { BuyingDTO } from '../dto/buyings.dto';

export const openBuyings = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const {
    openDate,
    deadline,
    openTime,
    deliveryStart,
    deliveryEnd,
    totalMin,
    totalMax,
    individualMin,
    price,
    deliveryFee,
    freeDeliveryFee,
    title,
    content,
    liquorId,
    regions,
  }: BuyingDTO = req.body;

  const wholesaler = await selectWholesaler(companyNumber);
  if (!wholesaler) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '공동구매 오픈 권한이 없습니다.');
  }

  await addBuying({
    openDate,
    deadline,
    openTime,
    deliveryStart,
    deliveryEnd,
    totalMin,
    totalMax,
    individualMin,
    price,
    deliveryFee,
    freeDeliveryFee,
    title,
    content,
    liquorId,
    companyNumber,
    regions,
  });

  return res.status(StatusCodes.CREATED).end();
};
