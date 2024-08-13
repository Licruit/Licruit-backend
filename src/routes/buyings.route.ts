import express, { Router } from 'express';
import { accessTokenValidate } from '../auth';
import { openValidate } from '../validators/buyings.validate';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { validate } from '../validators/validate';
import { openBuyings } from '../controllers/buyings.controller';
export const router: Router = express.Router();

router.post('/', [accessTokenValidate, ...openValidate, validate], wrapAsyncController(openBuyings));
