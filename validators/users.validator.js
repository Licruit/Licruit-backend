const { body } = require('express-validator');

const contactValidate = body('contact').notEmpty().isString().withMessage('연락처 확인 필요');
const companyNumberValidate = body('companyNumber').notEmpty().isString().isLength({ min: 10, max: 10 }).withMessage('사업자번호 확인 필요');
const passwordValidate = body('password').notEmpty().isString().isLength({ min: 6, max: 20 }).withMessage('비밀번호 확인 필요');
const businessNameValidate = body('businessName').notEmpty().isString().withMessage('상호명 확인 필요');
const addressValidate = body('address').notEmpty().isString().withMessage('주소 확인 필요');
const sectorIdValidate = body('sectorId').notEmpty().isNumeric().custom(value => {
    return value >= 1 && value <= 9 ? true : false;
}).withMessage('업종코드 확인 필요');

exports.registerValidate = [
    contactValidate,
    companyNumberValidate,
    passwordValidate,
    businessNameValidate,
    addressValidate,
    sectorIdValidate
]