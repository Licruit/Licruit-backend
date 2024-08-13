import express, { Router } from 'express';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import {
  getAllBuygins,
  getBuyingDetail,
  getWholesalerInfo,
  participateBuying,
} from '../controllers/buyings.controller';
import { allBuyingsValidate, buyingIdValidate, participateBuyingValidate } from '../validators/buyings.validator';
import { validate } from '../validators/validate';
import { accessTokenValidate } from '../auth';
export const router: Router = express.Router();

router.get('/', [...allBuyingsValidate, validate], wrapAsyncController(getAllBuygins));
router.get('/:buyingId', [buyingIdValidate, validate], wrapAsyncController(getBuyingDetail));
router.get('/:buyingId/wholesaler', [buyingIdValidate, validate], wrapAsyncController(getWholesalerInfo));
router.post(
  '/:buyingId',
  [accessTokenValidate, ...participateBuyingValidate, validate],
  wrapAsyncController(participateBuying),
);
