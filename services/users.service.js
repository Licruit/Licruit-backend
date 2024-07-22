const jsdom = require('jsdom');
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

exports.insertUser = async ({ contact, companyNumber, password, sectorId }) => {
    try {
        // 사업자 번호 중복 확인
        const isExistedUser = await findUser(companyNumber);
        if (isExistedUser.length) {
            throw new CustomError(
                '이미 사용된 사업자번호입니다.',
                StatusCodes.BAD_REQUEST
            );
        }

        // 사업자 조회 웹 크롤링
        const crawling = await fetch(`https://bizno.net/article/${companyNumber}`);
        const htmlString = await crawling.text();
        const htmlDOM = new jsdom.JSDOM(htmlString);

        const businessName = htmlDOM.window.document.querySelector('body section a');
        const name = htmlDOM.window.document.querySelector('section table tbody tr:nth-child(17) td');
        const address = htmlDOM.window.document.querySelector('section table tbody tr:nth-child(24) td');
        const isNotFoundCompanyNumber = htmlDOM.window.document.querySelector('section .titles h4');

        if (isNotFoundCompanyNumber) {
            throw new CustomError(
                '존재하지 않는 사업자번호 입니다.',
                StatusCodes.BAD_REQUEST
            )
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
                name ? name.textContent.trim() : '비공개',
                businessName.textContent.trim(),
                contact,
                address.textContent.trim(),
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