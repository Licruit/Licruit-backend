import express, { Router } from 'express';
import { accessTokenValidate } from '../auth';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { validate } from '../validators/validate';
import { pageValidate, reviewValidate } from '../validators/reviews.validator';
import { addReview, getReviews } from '../controllers/reviews.controller';
export const router: Router = express.Router();

router.post('/', [accessTokenValidate, ...reviewValidate, validate], wrapAsyncController(addReview));

router.get('/', [pageValidate, validate], wrapAsyncController(getReviews));
