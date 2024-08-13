import { body } from 'express-validator';

export const openDateValidate = body('openDate').notEmpty().isDate().withMessage('공동구매 오픈 날짜 필요');
export const deadlineValidate = body('deadline').notEmpty().isDate().withMessage('공동구매 마감 날짜 필요');
export const openTimeValidate = body('openTime')
  .notEmpty()
  .withMessage('오픈 시간 필요')
  .isString()
  .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  .withMessage('올바른 시간 형식(HH:MM)');

export const deliveryStartValidate = body('deliveryStart').notEmpty().isDate().withMessage('배송 시작 날짜 필요');
export const deliveryEndValidate = body('deliveryEnd').notEmpty().isDate().withMessage('배송 마감 날짜 필요');
export const totalMinValidate = body('totalMin')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => value >= 1)
  .withMessage('공동구매 최소 수량 필요');
export const totalMaxValidate = body('totalMax')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => value >= 1)
  .withMessage('공동구매 최대 수량 필요');
export const individualMinValidate = body('individualMin')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => value >= 1)
  .withMessage('개인 구매 최소 수량 필요');
export const priceValidate = body('price')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => value >= 1)
  .withMessage('주류 가격 필요');
export const deliveryFeeValidate = body('deliveryFee')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => value >= 0)
  .withMessage('배송비 필요');
export const freeDeliveryFeeValidate = body('freeDeliveryFee')
  .notEmpty()
  .isNumeric()
  .custom((value: number) => value >= 0)
  .withMessage('무료배송 최소 금액 필요');
export const titleValidate = body('title').notEmpty().isString().withMessage('공동구매 제목 필요');
export const contentValidate = body('content').notEmpty().isString().withMessage('공동구매 내용 필요');
export const liquorIdValidate = body('liquorId').notEmpty().isNumeric().withMessage('주류 id 필요');
export const regionsValidate = body('regions').notEmpty().isArray().withMessage('배송 가능 지역 필요');

export const openValidate = [
  openDateValidate,
  deadlineValidate,
  openTimeValidate,
  deliveryStartValidate,
  deliveryEndValidate,
  totalMinValidate,
  totalMaxValidate,
  individualMinValidate,
  priceValidate,
  deliveryEndValidate,
  freeDeliveryFeeValidate,
  titleValidate,
  contentValidate,
  liquorIdValidate,
  regionsValidate,
];
