import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
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

export const verifyTokenValidate = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.verify) {
      const verifyToken = req.headers.verify.toString();
      const decodedJwt: DecodedJWT = jwt.verify(verifyToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
      (req as TokenRequest).token = decodedJwt;

      next();
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '잘못된 verify token입니다.');
  }
};
