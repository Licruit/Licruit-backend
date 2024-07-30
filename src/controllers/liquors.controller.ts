import { StatusCodes } from 'http-status-codes';
import { selectAllLiquors, selectLiquorCategories } from '../services/liquors.service';
import HttpException from '../utils/httpExeption';
import { Request, Response } from 'express';
import { AllLiquorsDTO } from '../dto/liquors.dto';

export const getLiquorCategories = async (req: Request, res: Response) => {
  const liquorCategories = await selectLiquorCategories();
  if (!liquorCategories.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 주류 카테고리가 없습니다.');
  }

  return res.status(StatusCodes.OK).json(liquorCategories);
};

export const getAllLiquors = async (req: Request, res: Response) => {
  const { search, category, min_alcohol, max_alcohol, page }: AllLiquorsDTO = req.query;
  const liquorsAndPagination = await selectAllLiquors({ search, category, min_alcohol, max_alcohol, page });
  if (!liquorsAndPagination.liquors.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 주류 카탈로그가 없습니다.');
  }

  return res.status(StatusCodes.OK).json(liquorsAndPagination);
};
