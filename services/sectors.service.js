const { StatusCodes } = require("http-status-codes");
const initializeConnection = require("../db");
const { selectSectorsSql } = require("../models/sectors.model");
const { CustomError } = require('../utils/customError');

exports.selectSectors = async () => {
    try {
        const connection = await initializeConnection();

        const [sectors, fields] = await connection.query(selectSectorsSql);
        if (!sectors.length) {
            throw new CustomError(
                '조회할 업종 목록이 없습니다.',
                StatusCodes.NOT_FOUND
            );
        }

        await connection.end();
        return sectors;
    } catch (err) {
        throw new CustomError(
            err.message || '업종 조회 실패',
            err.statusCode || StatusCodes.NOT_FOUND
        );
    }
}