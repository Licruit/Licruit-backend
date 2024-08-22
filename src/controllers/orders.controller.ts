import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TokenRequest } from '../auth';
import { AllOrdersDTO, OwnerAndDeadlineVO } from '../dto/orders.dto';
import {
  selectAllOrders,
  selectOrderSummary,
  selectOwnerAndDeadline,
  updateCanceledOrder,
} from '../services/orders.service';
import HttpException from '../utils/httpExeption';

export const getAllOrders = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const { status }: AllOrdersDTO = req.query;

  const allOrders = await selectAllOrders(companyNumber, status);
  if (!allOrders.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 주문 내역이 없습니다.');
  }

  return res.status(StatusCodes.OK).json(allOrders);
};

export const getOrderSummary = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const summary = await selectOrderSummary(companyNumber);

  return res.status(StatusCodes.OK).json(summary);
};

export const cancelOrder = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const orderId = parseInt(req.params.orderId);

  const order = (await selectOwnerAndDeadline(orderId))?.dataValues as OwnerAndDeadlineVO;
  if (!order || order.userCompanyNumber !== companyNumber) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '해당 주문에 접근 권한이 없습니다.');
  }

  await updateCanceledOrder(orderId, order.deadline!);

  return res.status(StatusCodes.OK).end();
};
