const { StatusCodes } = require('http-status-codes');
const { insertUser } = require('../services/users.service');

exports.addUser = async (req, res, next) => {
    try {
        const { companyNumber, password, businessName, contact, address, sectorId } = req.body;
        await insertUser({ companyNumber, password, businessName, contact, address, sectorId });
        return res.status(StatusCodes.CREATED).end();
    } catch (err) {
        next(err);
    }
}