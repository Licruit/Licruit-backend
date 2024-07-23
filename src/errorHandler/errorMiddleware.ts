import { Request, Response, NextFunction, request } from "express";
import HttpException from "../utils/httpExeption";
import { StatusCodes } from "http-status-codes";

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    res.json({
        status: status,
        message: error.message
    });
}

export default errorMiddleware;