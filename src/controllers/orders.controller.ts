import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenRequest } from '../auth';
import { AllOrdersDTO } from '../dto/orders.dto';
import { selectAllOrders, selectOrderSummary } from '../services/orders.service';
import HttpException from '../utils/httpExeption';

export const getAllOrders = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const { status, page }: AllOrdersDTO = req.query;

  const allOrders = await selectAllOrders(companyNumber, status, page!);
  if (!allOrders.orders.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 주문 내역이 없습니다.');
  }

  return res.status(StatusCodes.OK).json(allOrders);
};

export const getOrderSummary = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const summary = await selectOrderSummary(companyNumber);

  return res.status(StatusCodes.OK).json(summary);
};
