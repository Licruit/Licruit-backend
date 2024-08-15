import express, { Router } from 'express';
import { accessTokenValidate } from '../auth';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { validate } from '../validators/validate';
import { reviewValidate } from '../validators/reviews.validator';
import { addReview } from '../controllers/reviews.controller';
export const router: Router = express.Router();

router.post('/', [accessTokenValidate, ...reviewValidate, validate], wrapAsyncController(addReview));
