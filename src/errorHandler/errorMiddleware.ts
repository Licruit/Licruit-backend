import { NextFunction, Request, Response } from 'express';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/winston';

export const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;

  logger.error(error.stack);

  res.status(status).json({
    status: status,
    message: error.message,
  });

  next();
};
