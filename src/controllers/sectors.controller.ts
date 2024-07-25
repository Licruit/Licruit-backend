import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../utils/httpExeption';
import { selectSectors } from '../services/sectors.service';

const getSectors = async (req: Request, res: Response, next: NextFunction) => {
  const sectors = await selectSectors();
  if (!sectors.length) {
    throw new HttpException(StatusCodes.NOT_FOUND, '조회할 업종 코드가 없습니다.');
  }

  return res.status(StatusCodes.OK).json(sectors);
};

export default getSectors;
