import express, { Router } from 'express';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getBuygins } from '../controllers/buyings.controller';
import { allBuyingsValidate } from '../validators/buyings.validator';
import { validate } from '../validators/validate';
export const router: Router = express.Router();

router.get('/', [...allBuyingsValidate, validate], wrapAsyncController(getBuygins));
