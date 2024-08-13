import { query } from 'express-validator';

export const pageValidate = query('page')
  .notEmpty()
  .isNumeric()
  .custom((value) => value >= 1)
  .withMessage('현재 페이지 숫자 필요');

export const buyingsListFilterValidate = query('sort')
  .notEmpty()
  .custom((value) => {
    const filterType = ['ranking', 'recent', 'deadline'];
    return filterType.includes(value);
  })
  .withMessage('정렬 기준 확인 필요');

export const allBuyingsValidate = [pageValidate, buyingsListFilterValidate];
