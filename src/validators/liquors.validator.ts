import { query, param } from 'express-validator';

export const pageValidate = query('page')
  .notEmpty()
  .isNumeric()
  .custom((value) => value >= 1)
  .withMessage('현재 페이지 숫자 필요');

export const liquorIdValidate = param('liquorId')
  .isNumeric()
  .custom((value) => value >= 1)
  .withMessage('전통주 id 확인 필요');

export const liquorReviewsValidate = [pageValidate, liquorIdValidate];
