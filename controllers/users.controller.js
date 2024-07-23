const { StatusCodes } = require("http-status-codes");
const authService = require("../services/users.service");
const { insertUser } = require('../services/users.service');

exports.postOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    await authService.sendOtp(phoneNumber);
    return res.status(StatusCodes.OK).json({ message: "인증번호 전송에 성공했습니다."});
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, code } = req.body;
    await authService.verifyOtp(phoneNumber, code);
    return res.status(StatusCodes.OK).json({ message : "인증에 성공했습니다."});
  } catch (err) {
    next(err)
  }
};

exports.addUser = async (req, res, next) => {
    try {
        const { companyNumber, password, businessName, contact, address, sectorId } = req.body;
        await insertUser({ companyNumber, password, businessName, contact, address, sectorId });
        return res.status(StatusCodes.CREATED).end();
    } catch (err) {
        next(err);
    }
}