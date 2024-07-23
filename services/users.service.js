const { CustomError } = require("../utils/customError");
const { StatusCodes } = require("http-status-codes");
const AWS = require("aws-sdk");
const cache = require("memory-cache");

const aws = new AWS.SNS({
  region: process.env.AWS_SNS_REGION,
  accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
  apiVersion: "2010-03-31"
});

exports.sendOtp = async (phoneNumber) => {
  try {
    if (!/^010[0-9]{8}$/.test(phoneNumber)) {
      throw new CustomError(
        "올바른 형식의 번호를 입력해주세요.",
        StatusCodes.UNAUTHORIZED
      );
    }

    cache.del(phoneNumber);
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    cache.put(phoneNumber, verifyCode);

    const params = {
      Message: `Licruit 인증번호 : ${verifyCode}`,
      PhoneNumber: `+82${phoneNumber}`
    };
    
    const publishTextPromise = await aws.publish(params).promise();
  } catch (err) {
    cache.del(phoneNumber);
    throw new CustomError(
      err.message || "인증번호 전송에 실패했습니다.",
      err.statusCode || StatusCodes.UNAUTHORIZED
    );
  }
};

exports.verifyOtp = async (phoneNumber, code) => {
  try {
    const cacheOtp = cache.get(phoneNumber);
    cache.del(phoneNumber);

    if (cacheOtp !== code) {
      throw new CustomError(
        "인증번호가 올바르지 않습니다.",
        StatusCodes.UNAUTHORIZED
      );
    }
  } catch (err) {
    throw new CustomError(
      err.message || "인증에 실패했습니다.",
      err.statusCode || StatusCodes.UNAUTHORIZED
    );
  }
};