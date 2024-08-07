import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import HttpException from './utils/httpExeption';

export interface TokenRequest extends Request {
  token: JwtPayload;
}

export interface DecodedJWT {
  decodedJwt: JwtPayload;
}

export const isExistedAccessToken = (req: Request) => {
  try {
    const accessToken = req.headers.authorization;
    if (accessToken) {
      const decodedJwt: DecodedJWT = jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
      (req as TokenRequest).token = decodedJwt;
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

export const accessTokenValidate = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization) {
      const accessToken = req.headers.authorization;
      const decodedJwt: DecodedJWT = jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
      (req as TokenRequest).token = decodedJwt;

      next();
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '잘못된 access token입니다.');
  }
};

export const refreshTokenValidate = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.refresh) {
      const refreshToken = req.headers.refresh.toString();
      const decodedJwt: DecodedJWT = jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
      (req as TokenRequest).token = decodedJwt;

      next();
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '잘못된 refresh token입니다.');
  }
};

export const verifyTokenValidate = (verifyToken: string) => {
  try {
    const decodedJwt: DecodedJWT = jwt.verify(verifyToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
    return true;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, '토큰의 유효시간이 지났습니다.');
    } else if (err instanceof JsonWebTokenError) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, '잘못된 verify token입니다.');
    } else {
      throw new HttpException(StatusCodes.UNAUTHORIZED, '알 수 없는 오류가 발생했습니다');
    }
  }
};
