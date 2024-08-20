import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { cancelOrder, getAllOrders, getOrderSummary } from '../controllers/orders.controller';
import { accessTokenValidate } from '../auth';
import { allOrdersValidate, orderIdValidate } from '../validators/orders.validator';
import { validate } from '../validators/validate';

router.get('/', [accessTokenValidate, ...allOrdersValidate, validate], wrapAsyncController(getAllOrders));
router.get('/summary', [accessTokenValidate], wrapAsyncController(getOrderSummary));
router.put('/:orderId', [accessTokenValidate, orderIdValidate, validate], wrapAsyncController(cancelOrder));
