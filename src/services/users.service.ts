import { RegisterDTO } from '../dto/users.dto';
import { User } from '../models/users.model';
import { getHashPassword, passwordEncryption } from '../utils/encryption';
import NodeCache from 'node-cache';
const myCache = new NodeCache({ stdTTL: 180 });
import jwt from 'jsonwebtoken';
import { Wholesaler } from '../models/wholesalers.model';
import { Token } from '../models/tokens.model';
import mime from 'mime-types';
import { awsSns, s3Client } from '../utils/aws';
import dotenv from 'dotenv';
import { ObjectCannedACL, PutObjectCommand } from '@aws-sdk/client-s3';
import { col } from 'sequelize';
import { Sector } from '../models/sectors.model';
import { sequelize } from '../models';
import { Withdrawal } from '../models/withdrawals.model';
import { Order } from '../models/orders.model';
import { Review } from '../models/reviews.model';
import { Buying } from '../models/buyings.model';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export const findUser = async (companyNumber: string) => {
  try {
    const user = await User.findOne({
      where: { companyNumber: companyNumber },
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
  isMarketing,
}: RegisterDTO) => {
  try {
    const { salt, hashPassword } = passwordEncryption(password);

    const newUser = await User.create({
      companyNumber: companyNumber,
      salt: salt,
      password: hashPassword,
      businessName: businessName,
      contact: contact,
      address: address,
      sectorId: sectorId,
      img: 'https://licruit-img-uploader.s3.ap-northeast-2.amazonaws.com/profile-images/default.jpeg',
      isMarketing: isMarketing,
    });

    return newUser;
  } catch {
    throw new Error('사용자 생성 실패');
  }
};

export const selectWholesaler = async (companyNumber: string) => {
  try {
    const wholesalers = await Wholesaler.findOne({
      where: { userCompanyNumber: companyNumber },
    });

    return wholesalers;
  } catch (err) {
    throw new Error('도매업자 조회 실패');
  }
};

export const insertWholesaler = async (companyNumber: string) => {
  try {
    const newWholesaler = await Wholesaler.create({
      userCompanyNumber: `${companyNumber}`,
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
        userCompanyNumber: companyNumber,
        tokenType: tokenType,
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
            userCompanyNumber: companyNumber,
            tokenType: tokenType,
          },
        },
      );
    } else {
      await Token.create({
        userCompanyNumber: companyNumber,
        tokenType: tokenType,
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
        userCompanyNumber: companyNumber,
        tokenType: tokenType,
        token: token,
      },
    });

    return deletedToken;
  } catch (err) {
    throw new Error(`${tokenType} token 삭제 실패`);
  }
};

export const deleteAllToken = async (companyNumber: string) => {
  try {
    await Token.destroy({
      where: {
        userCompanyNumber: companyNumber,
      },
    });
  } catch (err) {
    throw new Error(`token 삭제 실패`);
  }
};

export const updatePwd = async (companyNumber: string, password: string) => {
  try {
    const { salt, hashPassword } = passwordEncryption(password);

    const user = await User.findOne({
      where: { companyNumber: companyNumber },
    }).then((user) => {
      if (user) {
        user.update({ password: hashPassword, salt: salt });
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

    const offset = new Date().getTimezoneOffset() * 60000;
    const expTime = new Date(Date.now() + 180000 - offset);

    const params = {
      Message: `Licruit 인증번호 : ${verifyCode}`,
      PhoneNumber: `+82${contact}`,
    };

    await awsSns.publish(params).promise();
    return expTime;
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

export const selectUserProfile = async (companyNumber: string) => {
  try {
    const user = await User.findOne({
      attributes: [
        ['company_number', 'companyNumber'],
        ['business_name', 'businessName'],
        'contact',
        'img',
        [col('Sector.name'), 'sectorName'],
      ],
      include: [
        {
          model: Sector,
          attributes: [],
        },
      ],
      where: { companyNumber: companyNumber },
    });

    return user;
  } catch (err) {
    throw new Error('소상공인 조회에 실패했습니다.');
  }
};

export const selectWholesalerProfile = async (companyNumber: string) => {
  try {
    const wholesaler = await User.findOne({
      attributes: [
        ['company_number', 'companyNumber'],
        ['business_name', 'businessName'],
        'contact',
        'img',
        [col('Sector.name'), 'sectorName'],
        [col('Wholesaler.homepage'), 'homepage'],
        [col('Wholesaler.introduce'), 'introduce'],
      ],
      include: [
        {
          model: Wholesaler,
          attributes: [],
        },
        {
          model: Sector,
          attributes: [],
        },
      ],
      where: { companyNumber: companyNumber },
    });

    return wholesaler;
  } catch (err) {
    throw new Error('도매업자 조회에 실패했습니다.');
  }
};

export const updateUser = async (
  companyNumber: string,
  businessName: string,
  homepage: string,
  introduce: string,
  contact: string,
  sectorId: number,
  img: string,
) => {
  const transaction = await sequelize.transaction();
  try {
    await User.update(
      {
        businessName: businessName,
        contact: contact,
        sectorId: sectorId,
        img: img,
      },
      { where: { companyNumber: companyNumber }, transaction },
    );

    const wholesaler = await selectWholesaler(companyNumber);
    if (wholesaler) {
      await Wholesaler.update(
        {
          homepage: homepage,
          introduce: introduce,
        },
        { where: { userCompanyNumber: companyNumber }, transaction },
      );
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new Error('프로필 변경 실패');
  }
};

export const uploadImg = async (companyNumber: string, file: Express.Multer.File) => {
  try {
    const uploadDirectory = 'profile-images';
    const ext = mime.extension(file.mimetype);
    const filename = `${uploadDirectory}/${companyNumber}.${ext}`;

    const params = {
      Bucket: process.env.AWS_BUCKET as string,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read-write' as ObjectCannedACL,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;
    return fileUrl;
  } catch (err) {
    throw new Error('이미지 업로드 실패');
  }
};

export const insertWithdrawal = async (companyNumber: string, reason: string) => {
  const transaction = await sequelize.transaction();
  try {
    await Order.update(
      { userCompanyNumber: '0000000000' },
      {
        where: {
          userCompanyNumber: companyNumber,
        },
        transaction: transaction,
      },
    );

    await Review.update(
      { userCompanyNumber: '0000000000' },
      {
        where: {
          userCompanyNumber: companyNumber,
        },
        transaction: transaction,
      },
    );

    await Buying.update(
      { wholesalerCompanyNumber: '0000000000' },
      {
        where: {
          wholesalerCompanyNumber: companyNumber,
        },
        transaction: transaction,
      },
    );

    await User.destroy({
      where: {
        companyNumber: companyNumber,
      },
      transaction: transaction,
    });

    await Withdrawal.create({ reason: reason }, { transaction: transaction });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new Error('회원 탈퇴 실패');
  }
};

export const requestOCR = async (image: Express.Multer.File) => {
  try {
    const extension = mime.extension(image.mimetype);

    const ocrResult = await axios.post(
      process.env.OCR_URL!,
      {
        version: 'V2',
        requestId: uuidv4(),
        timestamp: Date.now(),
        images: [{ format: extension, data: image.buffer.toString('base64'), name: 'bizImg' }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-OCR-SECRET': process.env.OCR_SECRET,
        },
      },
    );

    const companyNumberObj = ocrResult.data.images[0].bizLicense.result.registerNumber;
    const companyNumber: string | null = companyNumberObj ? companyNumberObj[0].text.replaceAll('-', '') : null;
    const bisTypeArr = ocrResult.data.images[0].bizLicense.result.bisType;
    const isWholesaler: boolean = bisTypeArr
      ? bisTypeArr.map((industry: { text?: string }) => industry.text).includes('주류 도매업')
      : false;

    return { companyNumber, isWholesaler };
  } catch (err) {
    throw new Error('OCR 조회 실패');
  }
};
