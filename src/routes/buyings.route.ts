import express, { Router } from 'express';
import { accessTokenValidate } from '../auth';
import {
  allBuyingsValidate,
  buyingIdValidate,
  confirmValidate,
  openValidate,
  orderIdValidate,
  participateBuyingValidate,
} from '../validators/buyings.validator';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { validate } from '../validators/validate';
import {
  openBuyings,
  getAllBuygins,
  getBuyingDetail,
  getWholesalerInfo,
  participateBuying,
  getBuyingSummary,
  getWholesalerBuyings,
  getBuyingOrderList,
  getUserInfo,
  confirmAllOrder,
  confirmOrder,
  removeBuying,
  removeOrder,
  addBlacklist,
} from '../controllers/buyings.controller';
import { pageValidate } from '../validators/liquors.validator';
export const router: Router = express.Router();

router.post('/', [accessTokenValidate, ...openValidate, validate], wrapAsyncController(openBuyings));
router.get('/', [...allBuyingsValidate, validate], wrapAsyncController(getAllBuygins));
router.get('/summary', [accessTokenValidate], wrapAsyncController(getBuyingSummary));
router.get('/wholesaler', [accessTokenValidate, pageValidate, validate], wrapAsyncController(getWholesalerBuyings));
router.get(
  '/wholesaler/:buyingId',
  [accessTokenValidate, pageValidate, validate],
  wrapAsyncController(getBuyingOrderList),
);
router.get('/:buyingId', [buyingIdValidate, validate], wrapAsyncController(getBuyingDetail));
router.get('/:buyingId/wholesaler', [buyingIdValidate, validate], wrapAsyncController(getWholesalerInfo));
router.post(
  '/:buyingId',
  [accessTokenValidate, ...participateBuyingValidate, validate],
  wrapAsyncController(participateBuying),
);
router.get('/wholesaler/order/:orderId', [accessTokenValidate], wrapAsyncController(getUserInfo));
router.put(
  '/wholesaler/confirm/:buyingId',
  [accessTokenValidate, buyingIdValidate, validate],
  wrapAsyncController(confirmAllOrder),
);
router.put(
  '/wholesaler/confirm/:buyingId/:orderId',
  [accessTokenValidate, ...confirmValidate, validate],
  wrapAsyncController(confirmOrder),
);

router.delete('/wholesaler/:buyingId', [accessTokenValidate, buyingIdValidate], wrapAsyncController(removeBuying));
router.delete('/wholesaler/order/:orderId', [accessTokenValidate, orderIdValidate], wrapAsyncController(removeOrder));
router.post('/blacklist/:orderId', [accessTokenValidate, orderIdValidate], wrapAsyncController(addBlacklist));
