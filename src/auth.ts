import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const ensureAccessToken = (req: Request) => {
    try {
        const accessToken = req.cookies.access_token;

        if (accessToken) {
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
        const refreshToken = req.cookies.refresh_token;

        if (refreshToken) {
            const decodedJwt: any = jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY!);

            return decodedJwt;
        } else {
            throw new ReferenceError('로그인이 필요한 기능입니다.');
        }
    } catch (err) {
        return err;
    }
}

export const tokenValidate = (req: Request, res: Response, next: NextFunction) => {
    const authorization = ensureAccessToken(req);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "잘못된 토큰입니다.",
        });
    } else if (authorization instanceof ReferenceError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인이 필요한 기능입니다.",
        });
    }

    return next();
}