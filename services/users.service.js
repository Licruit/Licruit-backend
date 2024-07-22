const AWS = require("aws-sdk");
const cache = require("memory-cache");

const aws = new AWS.SNS({
  region: process.env.AWS_SNS_REGION,
  accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
  apiVersion: "2010-03-31"
});

exports.sendOtp = async (phoneNumber) => {
  console.log(aws)
  cache.del(phoneNumber);
  const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  cache.put(phoneNumber, verifyCode);

  const params = {
    Message: `Licruit 인증번호 : ${verifyCode}`,
    PhoneNumber: `+82${phoneNumber}`
  };

  try {
    const publishTextPromise = await aws.publish(params).promise();
    console.log("인증번호를 전송했습니다.");
  } catch (error) {
    cache.del(phoneNumber);
    throw new Error("인증번호 전송에 실패했습니다.");
  }
};

exports.verifyOtp = async (phoneNumber, code) => {
  const cacheOtp = cache.get(phoneNumber);
  console.log(cacheOtp);

  if (cacheOtp && cacheOtp === code) {
    cache.del(phoneNumber);
    return true;
  }

  return false;
};