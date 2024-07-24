import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const getDecodedAccessToken = (req: Request) => {
    try {
        if (req.headers.authorization) {
            const accessToken = req.headers.authorization;
            const decodedJwt: any = jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY!);
            return decodedJwt;
        } else {
            throw new ReferenceError('로그인이 필요한 기능입니다.');
        }
    } catch (err) {
        return err;
    }
}

export const getDecodedRefreshToken = (req: Request) => {
    try {
        if (req.headers.refresh) {
            const refreshToken = req.headers.refresh.toString();
            const decodedJwt: any = jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY!);
            return decodedJwt;
        } else {
            throw new ReferenceError('refresh token이 필요합니다.');
        }
    } catch (err) {
        return err;
    }
}

export const accessTokenValidate = (req: Request, res: Response, next: NextFunction) => {
    const authorization = getDecodedAccessToken(req);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인이 만료되었습니다.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "잘못된 access token입니다.",
        });
    } else if (authorization instanceof ReferenceError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인이 필요한 기능입니다.",
        });
    }

    return next();
}

export const refreshTokenValidate = (req: Request, res: Response, next: NextFunction) => {
    const authorization = getDecodedRefreshToken(req);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "refresh token이 만료되었습니다.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "잘못된 refresh token입니다.",
        });
    } else if (authorization instanceof ReferenceError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "refresh token이 필요한 기능입니다.",
        });
    }

    return next();
}