import { body } from 'express-validator';

export const contactValidate = body('contact').notEmpty().isString().withMessage('연락처 확인 필요');
export const companyNumberValidate = body('companyNumber')
  .notEmpty()
  .isString()
  .isLength({ min: 10, max: 10 })
  .withMessage('사업자번호 확인 필요');
export const loginCompanyNumberValidate = body('companyNumber').notEmpty().withMessage('사업자번호 필요');
export const passwordValidate = body('password')
  .notEmpty()
  .isString()
  .isLength({ min: 8, max: 15 })
  .custom((value: string) => {
    const regExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
    return regExp.test(value);
  })
  .withMessage('비밀번호 확인 필요');
export const loginPasswordValidate = body('password').notEmpty().withMessage('비밀번호 필요');
export const businessNameValidate = body('businessName').notEmpty().isString().withMessage('상호명 확인 필요');
export const addressValidate = body('address').notEmpty().isString().withMessage('주소 확인 필요');
export const sectorIdValidate = body('sectorId')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => {
    return value >= 1 && value <= 9 ? true : false;
  })
  .withMessage('업종코드 확인 필요');
export const marketingValidate = body('marketing').notEmpty().isBoolean().withMessage('마케팅 동의 여부 확인 필요');
const otpValidate = body('otp').notEmpty().isNumeric().isLength({ min: 6, max: 6 });
export const introduceValidate = body('introduce').optional().isString();
export const homepageValidate = body('homepage').optional().isString();

export const registerValidate = [
  contactValidate,
  companyNumberValidate,
  passwordValidate,
  businessNameValidate,
  addressValidate,
  sectorIdValidate,
  marketingValidate,
];

export const loginValidate = [loginCompanyNumberValidate, loginPasswordValidate];

export const resetPwValidate = [companyNumberValidate, contactValidate];

export const otpReqValidate = contactValidate;

export const otpCheckValidate = [contactValidate, otpValidate];

export const profileValidate = [
  businessNameValidate,
  introduceValidate,
  homepageValidate,
  contactValidate,
  sectorIdValidate,
];
