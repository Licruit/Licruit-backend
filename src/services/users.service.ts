import { RegisterDTO } from '../dto/users.dto';
import { User } from '../models/users.model';
import { getHashPassword, passwordEncryption } from '../utils/encryption';
import Cache from 'node-cache';
const myCache = new Cache();
import jwt from 'jsonwebtoken';
import { Wholesaler } from '../models/wholesalers.model';
import { Token } from '../models/tokens.model';
import { awsSns } from '../utils/aws';

export const findUser = async (companyNumber: string) => {
  try {
    const user = await User.findOne({
      where: { company_number: companyNumber },
    });

    return user;
  } catch (err) {
    throw new Error('사용자 조회 실패');
  }
};

export const insertUser = async ({
  companyNumber,
  password,
  businessName,
  contact,
  address,
  sectorId,
}: RegisterDTO) => {
  try {
    const { salt, hashPassword } = passwordEncryption(password);

    const newUser = await User.create({
      company_number: companyNumber,
      salt: salt,
      password: hashPassword,
      business_name: businessName,
      contact: contact,
      address: address,
      sector_id: sectorId,
      img: 'default',
    });

    return newUser;
  } catch {
    throw new Error('사용자 생성 실패');
  }
};

export const selectWholesaler = async (companyNumber: string) => {
  try {
    const wholesalers = await Wholesaler.findOne({
      where: { user_company_number: companyNumber },
    });

    return wholesalers;
  } catch (err) {
    throw new Error('도매업자 조회 실패');
  }
};

export const insertWholesaler = async (companyNumber: string) => {
  try {
    const newWholesaler = await Wholesaler.create({
      user_company_number: `${companyNumber}`,
    });

    return newWholesaler;
  } catch (err) {
    throw new Error('도매업자 권한 신청 실패');
  }
};

export const isSamePassword = (inputPassword: string, salt: string, password: string) => {
  const hashPassword = getHashPassword(inputPassword, salt);

  return hashPassword === password ? true : false;
};

export const createToken = (companyNumber: string, tokenType: string, expirationPeriod: string) => {
  const token = jwt.sign(
    {
      companyNumber: companyNumber,
      tokenType: tokenType,
    },
    process.env.JWT_PRIVATE_KEY!,
    {
      expiresIn: expirationPeriod,
      issuer: 'licruit',
    },
  );

  return token;
};

export const selectToken = async (companyNumber: string, tokenType: string) => {
  try {
    const token = await Token.findOne({
      where: {
        user_company_number: companyNumber,
        token_type: tokenType,
      },
    });

    return token;
  } catch (err) {
    throw new Error(`${tokenType} token 조회 실패`);
  }
};

export const setToken = async (companyNumber: string, tokenType: string, token: string) => {
  try {
    const isExistedToken = await selectToken(companyNumber, tokenType);

    if (isExistedToken) {
      await Token.update(
        { token: token },
        {
          where: {
            user_company_number: companyNumber,
            token_type: tokenType,
          },
        },
      );
    } else {
      await Token.create({
        user_company_number: companyNumber,
        token_type: tokenType,
        token: token,
      });
    }
  } catch (err) {
    throw new Error(`${tokenType} token 설정 실패`);
  }
};

export const deleteToken = async (companyNumber: string, tokenType: string, token: string) => {
  try {
    const deletedToken = await Token.destroy({
      where: {
        user_company_number: companyNumber,
        token_type: tokenType,
        token: token,
      },
    });

    return deletedToken;
  } catch (err) {
    throw new Error(`${tokenType} token 삭제 실패`);
  }
};

export const updatePwd = async (companyNumber: string, password: string) => {
  try {
    const { salt, hashPassword } = passwordEncryption(password);

    const user = await User.findOne({
      where: { company_number: companyNumber },
    }).then((user) => {
      if (user) {
        user.update({ password: hashPassword });
      }
    });

    return user;
  } catch (err) {
    throw new Error('비밀번호 변경 실패');
  }
};

export const sendOtp = async (contact: string) => {
  try {
    myCache.del(contact);
    const verifyCode: number = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    myCache.set(contact, verifyCode, 180000);

    const params = {
      Message: `Licruit 인증번호 : ${verifyCode}`,
      PhoneNumber: `+82${contact}`,
    };
    const publishTextPromise = await awsSns.publish(params).promise();
  } catch (err) {
    myCache.del(contact);
    throw new Error('인증번호 전송에 실패했습니다.');
  }
};

export const checkOtp = async (contact: string, otp: number) => {
  try {
    const cacheOtp: number | undefined = myCache.get(contact);
    myCache.del(contact);

    return cacheOtp && cacheOtp === otp;
  } catch (err) {
    throw new Error('사용자 인증에 실패했습니다.');
  }
};
