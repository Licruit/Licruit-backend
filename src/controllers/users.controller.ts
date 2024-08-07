import { Request, Response } from 'express';
import { RegisterDTO, OtpRequestDTO, OtpVerificationDTO, LoginDTO, CompnayNumberCheckDTO } from '../dto/users.dto';
import {
  checkOtp,
  createToken,
  deleteAllToken,
  deleteToken,
  findUser,
  insertUser,
  insertWholesaler,
  insertWithdrawal,
  isSamePassword,
  isWithdrewCompanyNumber,
  selectToken,
  selectUserProfile,
  selectWholesaler,
  selectWholesalerProfile,
  sendOtp,
  setToken,
  updatePwd,
  updateUser,
  uploadImg,
} from '../services/users.service';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';
import { TokenRequest, verifyTokenValidate } from '../auth';

type CookieType = {
  sameSite: 'none' | 'strict' | 'lax';
  secure: boolean;
  httpOnly: boolean;
};

const cookieOptions: CookieType = { sameSite: 'none', secure: true, httpOnly: true };

export const getUser = async (req: Request, res: Response) => {
  const { companyNumber }: CompnayNumberCheckDTO = req.body;

  const foundUser = await findUser(companyNumber);
  if (foundUser) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '이미 사용된 사업자번호입니다.');
  }

  return res.status(StatusCodes.OK).end();
};

export const addUser = async (req: Request, res: Response) => {
  const { companyNumber, password, businessName, contact, address, sectorId, isMarketing }: RegisterDTO = req.body;

  const isWithdrewUser = await isWithdrewCompanyNumber(companyNumber);
  if (isWithdrewUser) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '탈퇴한 사업자 번호로는 재가입이 불가능합니다.');
  }

  const foundUser = await findUser(companyNumber);
  if (foundUser) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '이미 사용된 사업자번호입니다.');
  }
  await insertUser({
    companyNumber,
    password,
    businessName,
    contact,
    address,
    sectorId,
    isMarketing,
  });

  return res.status(StatusCodes.CREATED).end();
};

export const addWholesaler = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const wholesaler = await selectWholesaler(companyNumber);
  if (wholesaler) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '이미 도매업체 권한으로 전환된 사업자번호입니다.');
  }

  await insertWholesaler(companyNumber);

  return res.status(StatusCodes.CREATED).end();
};

export const login = async (req: Request, res: Response) => {
  const { companyNumber, password }: LoginDTO = req.body;

  const foundUser = await findUser(companyNumber);
  if (!foundUser) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '아이디 또는 비밀번호가 잘못되었습니다.');
  }
  const isLoggedInSuccess = isSamePassword(password, foundUser.salt, foundUser.password);
  if (!isLoggedInSuccess) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '아이디 또는 비밀번호가 잘못되었습니다.');
  }
  const wholesaler = await selectWholesaler(companyNumber);

  const accessToken = createToken(companyNumber, 'access', '1h');
  const refreshToken = createToken(companyNumber, 'refresh', '30d');

  await setToken(companyNumber, 'refresh', refreshToken);

  return res.status(StatusCodes.OK).json({
    accessToken: accessToken,
    refreshToken: refreshToken,
    isWholesaler: wholesaler ? true : false,
  });
};

export const createNewAccessToken = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const refreshToken = await selectToken(companyNumber, 'refresh');
  if (!refreshToken || req.headers.refresh !== refreshToken.token) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '존재하지 않는 refresh toekn입니다.');
  }

  const accessToken = createToken(companyNumber, 'access', '1h');

  return res.status(StatusCodes.OK).json({
    accessToken: accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const deletedToken = await deleteToken(companyNumber, 'refresh', req.headers.refresh!.toString());
  if (!deletedToken) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '존재하지 않는 refresh token입니다.');
  }

  return res.status(StatusCodes.OK).end();
};

export const resetPwd = async (req: Request, res: Response) => {
  const { companyNumber, contact } = req.body;

  const user = await findUser(companyNumber);
  if (!user) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '존재하지 않는 사업자 번호입니다.');
  } else if (user.contact !== contact) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '등록된 번호와 다른 번호입니다.');
  }

  const verifyToken = createToken(companyNumber, 'verify', '10m');
  await setToken(companyNumber, 'verify', verifyToken);

  res.cookie('verify_token', verifyToken, cookieOptions);

  return res.status(StatusCodes.OK).end();
};

export const putPwd = async (req: Request, res: Response) => {
  const { companyNumber, password } = req.body;

  const getCookie = req.cookies.verify_token;
  const verifyToken = await selectToken(companyNumber, 'verify');
  if (!verifyTokenValidate(getCookie) || !verifyToken || getCookie !== verifyToken.token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'verify token이 올바르지 않습니다.' });
  }

  await updatePwd(companyNumber, password);
  await deleteAllToken(companyNumber);
  return res.status(StatusCodes.OK).end();
};

export const postOtp = async (req: Request, res: Response) => {
  const { contact }: OtpRequestDTO = req.body;

  const expTime = await sendOtp(contact);
  return res.status(StatusCodes.OK).json({ expTime: expTime.toISOString() });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { contact, otp }: OtpVerificationDTO = req.body;

  const isVerified = await checkOtp(contact, otp);
  if (isVerified) {
    return res.status(StatusCodes.OK).end();
  } else {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '인증번호가 올바르지 않습니다.');
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const wholesaler = await selectWholesaler(companyNumber);
  if (wholesaler) {
    const wholesalerInfo = await selectWholesalerProfile(companyNumber);
    return res.status(StatusCodes.OK).json(wholesalerInfo);
  } else {
    const user = await selectUserProfile(companyNumber);
    return res.status(StatusCodes.OK).json(user);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const { businessName, introduce, homepage, contact, sectorId, img } = req.body;

  await updateUser(companyNumber, businessName, introduce, homepage, contact, sectorId, img);
  return res.status(StatusCodes.OK).end();
};

export const uploadProfileImg = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const fileData = req.file as Express.Multer.File;

  const imgUrl = await uploadImg(companyNumber, fileData);
  return res.status(StatusCodes.OK).json({ imgUrl: imgUrl });
};

export const removeUser = async (req: Request, res: Response) => {
  const tokenCompanyNumber = (req as TokenRequest).token.companyNumber;
  const { companyNumber, password, reason } = req.body;

  const foundUser = await findUser(companyNumber);
  if (tokenCompanyNumber !== companyNumber || !foundUser) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '아이디 또는 비밀번호가 잘못되었습니다.');
  }
  const isLoggedInSuccess = isSamePassword(password, foundUser.salt, foundUser.password);
  if (!isLoggedInSuccess) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '아이디 또는 비밀번호가 잘못되었습니다.');
  }
  const isWithdrewUser = await isWithdrewCompanyNumber(companyNumber);
  if (isWithdrewUser) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '이미 탈퇴한 회원입니다.');
  }

  await insertWithdrawal(companyNumber, reason);

  return res.status(StatusCodes.OK).end();
};
