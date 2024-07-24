import { NextFunction, Request, Response } from "express";
import { RegisterDTO, OtpRequestDTO, OtpVerificationDTO, LoginDTO } from "../dto/users.dto";
import { checkOtp, createToken, findUser, insertUser, isSamePassword, sendOtp } from "../services/users.service";
import HttpException from "../utils/httpExeption";
import { StatusCodes } from "http-status-codes";

export const addUser = async (req: Request, res: Response) => {
    const registerDTO: RegisterDTO = req.body;

    const foundUser = await findUser(registerDTO.companyNumber);
    if (foundUser) {
        throw new HttpException(StatusCodes.BAD_REQUEST, '이미 사용된 사업자번호입니다.');
    }
    await insertUser(registerDTO);

    return res.status(StatusCodes.CREATED).end();
}

export const login = async (req: Request, res: Response) => {
    const { companyNumber, password }: LoginDTO = req.body;

    const foundUser = await findUser(companyNumber);
    if (!foundUser) {
        throw new HttpException(StatusCodes.UNAUTHORIZED, '아이디 또는 비밀번호가 잘못되었습니다.');
    }
    const isLoggedInSuccess = isSamePassword(password, foundUser.salt, foundUser.password);
    if (!isLoggedInSuccess) {
        throw new HttpException(StatusCodes.UNAUTHORIZED, '아이디 또는 비밀번호가 잘못되었습니다.');
    }

    res.cookie(
        'access_token',
        createToken(companyNumber, '1h'),
        { sameSite: 'none', secure: true, httpOnly: true }
    );
    res.cookie(
        'refresh_token',
        createToken(companyNumber, '30d'),
        { sameSite: 'none', secure: true, httpOnly: true }
    );

    return res.status(StatusCodes.OK).end();
}

export const postOtp = async (req: Request, res: Response) => {
    try {
        const { contact }: OtpRequestDTO = req.body;

        await sendOtp(contact);
        return res.status(StatusCodes.OK).json({ message: '인증번호 전송에 성공했습니다.' });
    } catch (err) {
        throw new HttpException(StatusCodes.UNAUTHORIZED, '인증번호 전송에 실패했습니다.');
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { contact, otp }: OtpVerificationDTO = req.body;

        const isVerified: boolean = await checkOtp(contact, otp);
        if (isVerified) {
            return res.status(StatusCodes.OK).json({ message: '인증에 성공했습니다.' });
        } else {
            throw new HttpException(StatusCodes.UNAUTHORIZED, '인증번호가 올바르지 않습니다.');
        }
    } catch (err) {
        throw new HttpException(StatusCodes.UNAUTHORIZED, '인증에 실패했습니다.');
    }
}