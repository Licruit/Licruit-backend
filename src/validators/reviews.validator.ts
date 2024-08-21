import { body, query } from 'express-validator';

export const buyingTitleValidate = body('buyingTitle').notEmpty().isString().withMessage('공동구매 이름 필요');
export const orderIdValidate = body('orderId').isNumeric().withMessage('주문 번호 필요');
export const titleValidate = body('title').notEmpty().isString().withMessage('리뷰 제목 필요');
export const contentValidate = body('content').notEmpty().isString().withMessage('리뷰 내용 필요');
export const scoreValidate = body('score').notEmpty().isDecimal().withMessage('점수 필요');
export const pageValidate = query('page')
  .isNumeric()
  .custom((value) => value >= 1)
  .withMessage('현재 페이지 숫자 필요');

export const reviewValidate = [orderIdValidate, titleValidate, contentValidate, scoreValidate];
