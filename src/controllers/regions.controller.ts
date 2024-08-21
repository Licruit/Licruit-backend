import { Request, Response } from 'express';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';
import { selectRegions } from '../services/regions.service';

export const getRegions = async (req: Request, res: Response) => {
  const regions = await selectRegions();
  if (!regions) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 지역 목록이 없습니다.');
  }

  return res.status(StatusCodes.OK).json(regions);
};
