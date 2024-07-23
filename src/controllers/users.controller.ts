import { NextFunction, Request, Response } from "express";
import { RegisterDTO } from "../dto/users.dto";
import { findUser, insertUser } from "../services/users.service";
import HttpException from "../utils/httpExeption";
import { StatusCodes } from "http-status-codes";

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const registerDTO: RegisterDTO = req.body;

        const foundUser = await findUser(registerDTO.companyNumber);
        if (foundUser) {
            throw new HttpException(StatusCodes.BAD_REQUEST, '이미 사용된 사업자번호입니다.');
        }
        await insertUser(registerDTO);

        return res.status(StatusCodes.CREATED).end();
    } catch (err) {
        next(err);
    }
}