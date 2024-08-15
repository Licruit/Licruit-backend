import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { cancelOrder, getAllOrders, getOrderDetail, getOrderSummary } from '../controllers/orders.controller';
import { accessTokenValidate } from '../auth';
import { allOrdersValidate, orderIdValidate } from '../validators/orders.validator';
import { validate } from '../validators/validate';

router.get('/', [accessTokenValidate, ...allOrdersValidate, validate], wrapAsyncController(getAllOrders));
router.get('/summary', [accessTokenValidate], wrapAsyncController(getOrderSummary));
router.get('/:orderId', [accessTokenValidate, orderIdValidate, validate], wrapAsyncController(getOrderDetail));
router.put('/:orderId', [accessTokenValidate, orderIdValidate, validate], wrapAsyncController(cancelOrder));
