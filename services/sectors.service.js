const { StatusCodes } = require("http-status-codes");
const { CustomError } = require('../utils/customError');
const Sector = require("../models/sectors.model");

exports.selectSectors = async () => {
    try {
        const sectors = await Sector.findAll({
            order: [["id", "asc"]]
        });
        if (!sectors.length) {
            throw new CustomError(
                '조회할 업종 목록이 없습니다.',
                StatusCodes.NOT_FOUND
            );
        }

        return sectors;
    } catch (err) {
        throw new CustomError(
            err.message || '업종 조회 실패',
            err.statusCode || StatusCodes.NOT_FOUND
        );
    }
}