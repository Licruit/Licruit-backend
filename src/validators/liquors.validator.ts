import { query } from 'express-validator';

export const pageValidate = query('page')
  .notEmpty()
  .isNumeric()
  .custom((value) => value >= 1)
  .withMessage('현재 페이지 숫자 필요');
