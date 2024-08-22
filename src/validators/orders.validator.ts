import { query, param } from 'express-validator';

export const pageValidate = query('page')
  .isNumeric()
  .custom((value) => value >= 1)
  .withMessage('페이지 번호 확인 필요');

export const orderStatusValidate = query('status').optional().isNumeric().withMessage('주문 상태 번호 확인 필요');

export const orderIdValidate = param('orderId').isNumeric().withMessage('주문 번호 확인 필요');
