import express, { Router } from 'express';
import { accessTokenValidate } from '../auth';
import { openValidate } from '../validators/buyings.validate';
import { allBuyingsValidate, buyingIdValidate, participateBuyingValidate } from '../validators/buyings.validator';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { validate } from '../validators/validate';
import {
  openBuyings,
  getAllBuygins,
  getBuyingDetail,
  getWholesalerInfo,
  participateBuying,
} from '../controllers/buyings.controller';
export const router: Router = express.Router();

router.post('/', [accessTokenValidate, ...openValidate, validate], wrapAsyncController(openBuyings));
router.get('/', [...allBuyingsValidate, validate], wrapAsyncController(getAllBuygins));
router.get('/:buyingId', [buyingIdValidate, validate], wrapAsyncController(getBuyingDetail));
router.get('/:buyingId/wholesaler', [buyingIdValidate, validate], wrapAsyncController(getWholesalerInfo));
router.post(
  '/:buyingId',
  [accessTokenValidate, ...participateBuyingValidate, validate],
  wrapAsyncController(participateBuying),
);