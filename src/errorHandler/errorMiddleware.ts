import { Request, Response } from 'express';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';

export const errorMiddleware = (error: HttpException, req: Request, res: Response) => {
  const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;

  console.log('에러 발생: ', error.message);
  console.log('에러 코드: ', status);
  console.log('에러 스택: ', error.stack);

  res.status(status).json({
    status: status,
    message: error.message,
  });
};
