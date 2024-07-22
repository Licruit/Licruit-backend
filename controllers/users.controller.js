const { StatusCodes } = require('http-status-codes');
const { insertUser } = require('../services/users.service');

exports.addUser = async (req, res, next) => {
    try {
        const { contact, companyNumber, password, sectorId } = req.body;
        await insertUser({ contact, companyNumber, password, sectorId });
        return res.status(StatusCodes.CREATED).end();
    } catch (err) {
        next(err);
    }
}