import { Request, Response } from 'express';
import morgan from 'morgan';
import { logger } from './winston';
import dotenv from 'dotenv';

dotenv.config();

const format = () => {
  const result =
    process.env.NODE_ENV === 'production'
      ? '[:remote-addr - :remote-user] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] ":referrer" ":user-agent"'
      : ':method :url :status :response-time ms - :res[content-length]';
  return result;
};

const stream = {
  write: (message: string) => {
    logger.info(message);
  },
};

const skip = (_: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.statusCode < 400;
  }
  return false;
};

export const morganMiddleware = morgan(format(), { stream, skip });
