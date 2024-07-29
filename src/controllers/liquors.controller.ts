import { StatusCodes } from 'http-status-codes';
import { selectLiquorCategories } from '../services/liquors.service';
import HttpException from '../utils/httpExeption';
import { Request, Response } from 'express';

export const getLiquorCategories = async (req: Request, res: Response) => {
  const liquorCategories = await selectLiquorCategories();
  if (!liquorCategories.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 주류 카테고리가 없습니다.');
  }

  return res.status(StatusCodes.OK).json(liquorCategories);
};
