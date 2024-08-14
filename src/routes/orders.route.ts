import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getAllOrders } from '../controllers/orders.controller';
import { accessTokenValidate } from '../auth';
import { allOrdersValidate } from '../validators/orders.validator';
import { validate } from '../validators/validate';

router.get('/', [accessTokenValidate, ...allOrdersValidate, validate], wrapAsyncController(getAllOrders));
