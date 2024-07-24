import { RegisterDTO } from "../dto/users.dto";
import { User } from "../models/users.model";
import { getHashPassword, passwordEncryption } from "../utils/encryption";
import AWS from "aws-sdk";
import Cache from "node-cache";
const myCache = new Cache();
import jwt from "jsonwebtoken";
import { Wholesaler } from "../models/wholesalers.model";
import { Token } from "../models/tokens.model";

export const findUser = async (companyNumber: string) => {
    try {
        const user = await User.findOne({
            where: { company_number: companyNumber }
        });

        return user;
    } catch (err) {
        console.log(err);
        throw new Error('사용자 조회 실패');
    }
}

export const insertUser = async ({
    companyNumber,
    password,
    businessName,
    contact,
    address,
    sectorId
}: RegisterDTO) => {
    try {
        const { salt, hashPassword } = passwordEncryption(password);

        const newUser = await User.create({
            company_number: companyNumber,
            salt: salt,
            password: hashPassword,
            business_name: businessName,
            contact: contact,
            address: address,
            sector_id: sectorId,
            img: 'default'
        });

        return newUser;
    } catch {
        throw new Error('사용자 생성 실패');
    }
}

export const selectWholesaler = async (companyNumber: string) => {
    try {
        const wholesalers = await Wholesaler.findOne({
            where: { user_company_number: companyNumber }
        });

        return wholesalers;
    } catch (err) {
        throw new Error('도매업자 조회 실패');
    }
}

export const insertWholesaler = async (companyNumber: string) => {
    try {
        const newWholesaler = await Wholesaler.create({
            user_company_number: `${companyNumber}`
        });

        return newWholesaler;
    } catch (err) {
        throw new Error('도매업자 권한 신청 실패');
    }
}

export const isSamePassword = (inputPassword: string, salt: string, password: string) => {
    const hashPassword = getHashPassword(inputPassword, salt);

    return hashPassword === password ? true : false;
}

export const createToken = (companyNumber: string, expirationPeriod: string) => {
    const token = jwt.sign({
        companyNumber: companyNumber
    }, process.env.JWT_PRIVATE_KEY!, {
        expiresIn: expirationPeriod,
        issuer: "licruit"
    });

    return token;
}

export const selectRefreshToken = async (companyNumber: string) => {
    try {
        const token = await Token.findOne({
            where: {
                user_company_number: companyNumber
            }
        });

        return token;
    } catch (err) {
        throw new Error('refresh token 조회 실패');
    }
}

export const setRefreshToken = async (companyNumber: string, refreshToken: string) => {
    try {
        const isExistedToken = await selectRefreshToken(companyNumber);

        if (isExistedToken) {
            await Token.update(
                { refresh_token: refreshToken },
                { where: { user_company_number: companyNumber } }
            );
        } else {
            await Token.create({
                user_company_number: companyNumber,
                refresh_token: refreshToken
            });
        }
    } catch (err) {
        throw new Error('refresh token 설정 실패');
    }
}

export const deleteToken = async (companyNumber: string, refreshToken: string) => {
    try {
        const deletedToken = await Token.destroy({
            where: {
                user_company_number: companyNumber,
                refresh_token: refreshToken
            }
        });

        return deletedToken;
    } catch (err) {
        throw new Error('refresh token 삭제 실패');
    }
}

export const sendOtp = async (contact: string) => {
    try {
        const aws = new AWS.SNS({
            region: process.env.AWS_SNS_REGION,
            accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
            apiVersion: "2010-03-31"
        });

        myCache.del(contact);
        const verifyCode: number = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        myCache.set(contact, verifyCode, 180000);

        const params = {
            Message: `Licruit 인증번호 : ${verifyCode}`,
            PhoneNumber: `+82${contact}`
        };

        const publishTextPromise = await aws.publish(params).promise();
    } catch (err) {
        myCache.del(contact);
        throw new Error('인증번호 전송에 실패했습니다.');
    }
}

export const checkOtp = async (contact: string, otp: number) => {
    try {
        const cacheOtp: number | undefined = myCache.get(contact);
        myCache.del(contact);

        if (cacheOtp && cacheOtp === otp) {
            return true;
        }
        return false;
    } catch (err) {
        throw new Error('인증에 실패했습니다.')
    }
};