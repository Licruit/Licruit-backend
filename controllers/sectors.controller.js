const { StatusCodes } = require('http-status-codes');
const { selectSectors } = require('../services/sectors.service');

exports.getSectors = async (req, res, next) => {
    try {
        const sectors = await selectSectors();

        return res.status(StatusCodes.OK).json(sectors);
    } catch (err) {
        next(err);
    }
}