import { Request, Response } from 'express';
import { FilterType } from '../dto/buyings.dto';
import { selectBuyings } from '../services/buyings.service';
import { StatusCodes } from 'http-status-codes';

export const getBuygins = async (req: Request, res: Response) => {
  const filter = req.query.filter as FilterType;
  const page = parseInt(req.query.page as string);

  const buyingList = await selectBuyings(filter, page);

  return res.status(StatusCodes.OK).json(buyingList);
};
