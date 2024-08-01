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
  isSamePassword,
  selectToken,
  selectWholesaler,
  sendOtp,
  setToken,
  updateProfileImg,
  updatePwd,
  updateUser,
} from '../services/users.service';
import HttpException from '../utils/httpExeption';
import { StatusCodes } from 'http-status-codes';
import { TokenRequest } from '../auth';

const cookieOptions = { sameSite: false, secure: true, httpOnly: true };

export const getUser = async (req: Request, res: Response) => {
  const { companyNumber }: CompnayNumberCheckDTO = req.body;

  const foundUser = await findUser(companyNumber);
  if (foundUser) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '이미 사용된 사업자번호입니다.');
  }

  return res.status(StatusCodes.OK).end();
};

export const addUser = async (req: Request, res: Response) => {
  const { companyNumber, password, businessName, contact, address, sectorId }: RegisterDTO = req.body;

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

  const accessToken = createToken(companyNumber, 'access', '1h');
  const refreshToken = createToken(companyNumber, 'refresh', '30d');

  await setToken(companyNumber, 'refresh', refreshToken);

  res.cookie('access_token', accessToken, cookieOptions);
  res.cookie('refresh_token', refreshToken, cookieOptions);

  return res.status(StatusCodes.OK).end();
};

export const createNewAccessToken = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const refreshToken = await selectToken(companyNumber, 'refresh');
  if (!refreshToken || req.headers.refresh !== refreshToken.token) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, '존재하지 않는 refresh toekn입니다.');
  }

  res.cookie('access_token', createToken(companyNumber, 'access', '1h'), cookieOptions);

  return res.status(StatusCodes.OK).end();
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
  const { companyNumber, contact, otp } = req.body;

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
  const companyNumber = (req as TokenRequest).token.companyNumber;

  const verifyToken = await selectToken(companyNumber, 'verify');
  if (!verifyToken || req.headers.verify !== verifyToken.token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: '인증 시간이 만료되었습니다.' });
  }

  const { password } = req.body;

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

export const putProfile = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;
  const { businessName, introduce, homepage, contact, sectorId } = req.body;

  await updateUser(companyNumber, businessName, introduce, homepage, contact, sectorId);
  return res.status(StatusCodes.OK).end();
};

export const putProfileImg = async (req: Request, res: Response) => {
  const companyNumber = (req as TokenRequest).token.companyNumber;

  if (!req.file) {
    throw new HttpException(StatusCodes.BAD_REQUEST, '파일을 선택해 주세요.');
  }

  const fileData: Express.Multer.File = req.file;
  const imgUrl = await updateProfileImg(companyNumber, fileData);
  return res.status(StatusCodes.OK).json({ imgUrl: imgUrl });
};
