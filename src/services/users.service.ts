import { RegisterDTO } from "../dto/users.dto";
import { User } from "../models/users.model";
import { passwordEncryption } from "../utils/encryption";
import AWS from "aws-sdk";
import Cache from "node-cache";
const myCache = new Cache();

export const findUser = async (companyNumber: string) => {
    try {
        const user = await User.findOne({
            where: { company_number: companyNumber }
        });

        return user;
    } catch (err) {
        throw new Error('사용자 조회 실패');
    }
}

export const insertUser = async (registerDTO: RegisterDTO) => {
    try {
        const { salt, hashPassword } = passwordEncryption(registerDTO.password);

        const newUser = await User.create({
            company_number: registerDTO.companyNumber,
            salt: salt,
            password: hashPassword,
            business_name: registerDTO.businessName,
            contact: registerDTO.contact,
            address: registerDTO.address,
            sector_id: registerDTO.sectorId,
            img: 'default'
        })

        return newUser;
    } catch {
        throw new Error('사용자 생성 실패');
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