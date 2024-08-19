import { Request, Response } from 'express';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';
import { isExistedAccessToken, TokenRequest } from '../auth';
import { selectWholesaler } from '../services/users.service';
import { BuyingDTO, SortType } from '../dto/buyings.dto';
import {
  addBuying,
  insertOrder,
  selectAllBuyings,
  selectBlacklistCount,
  selectBuyingDetail,
  selectBuyingOrderList,
  selectBuyingSummary,
  selectBuyingWholesaler,
  selectDeliveryAvaliableAreas,
  selectOneBuying,
  selectUserInfo,
  selectWholesalerBuyings,
  selectWholesalerInfo,
} from '../services/buyings.service';

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

export const getAllBuygins = async (req: Request, res: Response) => {
  const sort = req.query.sort as SortType;
  const page = parseInt(req.query.page as string);

  const buyingList = await selectAllBuyings(sort, page);
  if (!buyingList.buyings.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 공동구매 목록이 없습니다.');
  }

  return res.status(StatusCodes.OK).json(buyingList);
};

export const getBuyingDetail = async (req: Request, res: Response) => {
  const buyingId = parseInt(req.params.buyingId);
  const companyNumber = isExistedAccessToken(req) ? (req as TokenRequest).token.companyNumber : null;

  const buyingDetail = await selectBuyingDetail(buyingId, companyNumber);
  if (!buyingDetail) {
    throw new HttpException(StatusCodes.NOT_FOUND, '존재하지 않는 공동구매입니다.');
  }
  const deliveryRegions = await selectDeliveryAvaliableAreas(buyingId);

  return res.status(StatusCodes.OK).json({
    ...buyingDetail.dataValues,
    deliveryRegions,
  });
};

export const getWholesalerInfo = async (req: Request, res: Response) => {
  const buyingId = parseInt(req.params.buyingId);

  const buying = await selectOneBuying(buyingId);
  if (!buying) {
    throw new HttpException(StatusCodes.NOT_FOUND, '존재하지 않는 공동구매입니다.');
  }
  const wholesaler = await selectWholesalerInfo(buying.wholesalerCompanyNumber);

  return res.status(StatusCodes.OK).json(wholesaler);
};

export const participateBuying = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const buyingId = parseInt(req.params.buyingId);
  const { quantity } = req.body;

  const buying = await selectOneBuying(buyingId);
  if (!buying) {
    throw new HttpException(StatusCodes.NOT_FOUND, '존재하지 않는 공동구매입니다.');
  }
  if (new Date(`${buying.openDate} ${buying.openTime}`) > new Date()) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '아직 오픈되지 않은 공동구매입니다.');
  }

  const blacklistCount = await selectBlacklistCount(companyNumber);
  if (blacklistCount > 2) {
    throw new HttpException(StatusCodes.FORBIDDEN, '블랙리스트 회원입니다.');
  }

  await insertOrder(buyingId, companyNumber, quantity);

  return res.status(StatusCodes.CREATED).end();
};

export const getBuyingSummary = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const wholesaler = await selectWholesaler(companyNumber);
  if (!wholesaler) {
    throw new HttpException(StatusCodes.NOT_FOUND, '도매업자가 아닙니다.');
  }

  const summary = await selectBuyingSummary(companyNumber);
  return res.status(StatusCodes.OK).json(summary);
};

export const getWholesalerBuyings = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const page = parseInt(req.query.page as string);

  const wholesaler = await selectWholesaler(companyNumber);
  if (!wholesaler) {
    throw new HttpException(StatusCodes.NOT_FOUND, '도매업자가 아닙니다.');
  }

  const buyings = await selectWholesalerBuyings(companyNumber, page);
  return res.status(StatusCodes.OK).json(buyings);
};

export const getBuyingOrderList = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const buyingId = parseInt(req.params.buyingId);
  const page = parseInt(req.query.page as string);
  const type = req.query.type as string;

  const wholesaler = await selectWholesaler(companyNumber);
  if (!wholesaler) {
    throw new HttpException(StatusCodes.NOT_FOUND, '도매업자가 아닙니다.');
  }

  const buyingOrderList = await selectBuyingOrderList(buyingId, page, type);
  return res.status(StatusCodes.OK).json(buyingOrderList);
};

export const getUserInfo = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const orderId = parseInt(req.params.orderId);

  const wholesaler = await selectWholesaler(companyNumber);
  if (!wholesaler) {
    throw new HttpException(StatusCodes.NOT_FOUND, '도매업자가 아닙니다.');
  }

  const buyingWholesaler = await selectBuyingWholesaler(orderId);
  if (companyNumber !== buyingWholesaler) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '공동구매 도매업자와 일치하지 않습니다.');
  }

  const userInfo = await selectUserInfo(orderId);
  return res.status(StatusCodes.OK).json(userInfo);
};
