import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import {
  getAllLiquors,
  getLiquorCategories,
  getLiquorDetail,
  getLiquorReviews,
  likeLiquor,
  unlikeLiquor,
} from '../controllers/liquors.controller';
import { liquorIdValidate, liquorReviewsValidate, pageValidate } from '../validators/liquors.validator';
import { validate } from '../validators/validate';
import { accessTokenValidate } from '../auth';

router.get('/', [pageValidate, validate], wrapAsyncController(getAllLiquors));

router.get('/category', wrapAsyncController(getLiquorCategories));

router.get('/:liquorId', [liquorIdValidate, validate], wrapAsyncController(getLiquorDetail));

router.post('/:liquorId/likes', [accessTokenValidate, liquorIdValidate, validate], wrapAsyncController(likeLiquor));

router.delete('/:liquorId/likes', [accessTokenValidate, liquorIdValidate, validate], wrapAsyncController(unlikeLiquor));

router.get('/:liquorId/reviews', [...liquorReviewsValidate, validate], wrapAsyncController(getLiquorReviews));
