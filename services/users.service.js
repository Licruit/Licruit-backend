const { CustomError } = require('../utils/customError');
const { StatusCodes } = require('http-status-codes');
const initializeConnection = require('../db');
const { insertUserSql, selectUserSql } = require('../models/users.model');
const { passwordEncryption } = require('../utils/encryption');

const findUser = async (companyNumber) => {
    try {
        const connection = await initializeConnection();
        const [user, fields] = await connection.query(selectUserSql, [companyNumber]);
        await connection.end();
        return user;
    } catch (err) {
        throw new CustomError(
            err.message || '회원 조회 실패',
            err.statusCode || StatusCodes.NOT_FOUND
        );
    }
}

exports.insertUser = async ({ companyNumber, password, businessName, contact, address, sectorId }) => {
    try {
        // 사업자 번호 중복 확인
        const isExistedUser = await findUser(companyNumber);
        if (isExistedUser.length) {
            throw new CustomError(
                '이미 사용된 사업자번호입니다.',
                StatusCodes.BAD_REQUEST
            );
        }

        // 비밀번호 암호화
        const { salt, hashPassword } = passwordEncryption(password);

        // 사용자 추가
        const connection = await initializeConnection();
        await connection.query(
            insertUserSql,
            [
                companyNumber,
                salt,
                hashPassword,
                businessName,
                contact,
                address,
                sectorId,
                'default'
            ]
        );
        await connection.end();
    } catch (err) {
        throw new CustomError(
            err.message || '회원 가입 실패',
            err.statusCode || StatusCodes.NOT_FOUND
        );
    }
}