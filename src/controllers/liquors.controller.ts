import { StatusCodes } from 'http-status-codes';
import {
  deleteLike,
  insertLike,
  selectAllLiquors,
  selectLike,
  selectLiquor,
  selectLiquorCategories,
} from '../services/liquors.service';
import HttpException from '../utils/httpExeption';
import { Request, Response } from 'express';
import { AllLiquorsDTO } from '../dto/liquors.dto';
import { TokenRequest } from '../auth';

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

export const likeLiquor = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const liquorId = parseInt(req.params.liquorId);

  const liquor = await selectLiquor(liquorId);
  if (!liquor) {
    throw new HttpException(StatusCodes.NOT_FOUND, '존재하지 않는 전통주입니다.');
  }
  const isLiked = await selectLike(liquorId, companyNumber);
  if (isLiked) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '이미 좋아요되어있는 전통주입니다.');
  }
  await insertLike(liquorId, companyNumber);

  return res.status(StatusCodes.CREATED).end();
};

export const unlikeLiquor = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const liquorId = parseInt(req.params.liquorId);

  const liquor = await selectLiquor(liquorId);
  if (!liquor) {
    throw new HttpException(StatusCodes.NOT_FOUND, '존재하지 않는 전통주입니다.');
  }
  const isLiked = await selectLike(liquorId, companyNumber);
  if (!isLiked) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '좋아요되어있지 않은 전통주입니다.');
  }
  await deleteLike(liquorId, companyNumber);

  return res.status(StatusCodes.OK).end();
};
