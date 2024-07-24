import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import HttpException from "./utils/httpExeption";

export interface TokenRequest extends Request {
    companyNumber: string;
}

export interface DecodedJWT {
    companyNumber: string;
}

export const accessTokenValidate = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers.authorization) {
            const accessToken = req.headers.authorization;
            const decodedJwt: DecodedJWT = jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
            (req as TokenRequest).companyNumber = decodedJwt.companyNumber;

            next();
        } else {
            throw new Error();
        }
    } catch (err) {
        throw new HttpException(StatusCodes.UNAUTHORIZED, '잘못된 access token입니다.');
    }
}

export const refreshTokenValidate = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers.refresh) {
            const refreshToken = req.headers.refresh.toString();
            const decodedJwt: DecodedJWT = jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY!) as DecodedJWT;
            (req as TokenRequest).companyNumber = decodedJwt.companyNumber;

            next();
        } else {
            throw new Error();
        }
    } catch (err) {
        throw new HttpException(StatusCodes.UNAUTHORIZED, '잘못된 refresh token입니다.')
    }
}