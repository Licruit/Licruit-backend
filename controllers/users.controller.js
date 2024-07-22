const authService = require("../services/users.service");

exports.postOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    await authService.sendOtp(phoneNumber);
    return res.status(200).json({ message: "인증번호 전송에 성공했습니다."});
  } catch (err) {
    return res.status(401).json({ message: "인증번호 전송에 실패했습니다."});;
  }
};

exports.verifyOtp = async (req, res) => {
  const { phoneNumber, code } = req.body;
  try {
    const ivVerified = await authService.verifyOtp(phoneNumber, code);
    if (ivVerified) {
      return res.status(200).json({ message : "인증에 성공했습니다."});
    } else {
      return res.status(401).json({ message : "인증번호가 올바르지 않습니다."});
    }
  } catch (err) {
    return res.status(401).json({ message : "인증에 실패했습니다."});
  }
};