import { StatusCodes } from 'http-status-codes';
import {
  deleteLike,
  insertLike,
  selectAllLiquors,
  selectLike,
  selectLiquor,
  selectLiquorCategories,
  selectLiquorDetail,
  selectLiquorOngoingBuyings,
  selectLiquorReviews,
} from '../services/liquors.service';
import HttpException from '../utils/httpExeption';
import { Request, Response } from 'express';
import { AllLiquorsDTO, LiquorReviewsDTO } from '../dto/liquors.dto';
import { isExistedAccessToken, TokenRequest } from '../auth';

export const getLiquorCategories = async (req: Request, res: Response) => {
  const liquorCategories = await selectLiquorCategories();
  if (!liquorCategories.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 주류 카테고리가 없습니다.');
  }

  return res.status(StatusCodes.OK).json(liquorCategories);
};

export const getLiquorDetail = async (req: Request, res: Response) => {
  const companyNumber = isExistedAccessToken(req) ? (req as TokenRequest).token.companyNumber : null;
  const liquorId = parseInt(req.params.liquorId);

  const liquor = await selectLiquorDetail(liquorId, companyNumber);
  if (!liquor) {
    throw new HttpException(StatusCodes.NOT_FOUND, '존재하지 않는 전통주입니다.');
  }

  return res.status(StatusCodes.OK).json(liquor);
};

export const getAllLiquors = async (req: Request, res: Response) => {
  const { search, category, minAlcohol, maxAlcohol, page, sort }: AllLiquorsDTO = req.query;
  const liquorsAndPagination = await selectAllLiquors({ search, category, minAlcohol, maxAlcohol, page, sort });
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

export const getLiquorReviews = async (req: Request, res: Response) => {
  const liquorId = parseInt(req.params.liquorId);
  const { sort, page }: LiquorReviewsDTO = req.query;

  const liquorReviews = await selectLiquorReviews(liquorId, page!, sort);
  if (!liquorReviews.reviews.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 리뷰 목록이 없습니다.');
  }

  return res.status(StatusCodes.OK).json(liquorReviews);
};

export const getLiquorOngoingBuyings = async (req: Request, res: Response) => {
  const liquorId = parseInt(req.params.liquorId);

  const buyings = await selectLiquorOngoingBuyings(liquorId);
  if (!buyings) {
    throw new HttpException(StatusCodes.NOT_FOUND, '진행 중인 공동구매가 없습니다.');
  }

  return res.status(StatusCodes.OK).json(buyings);
};
