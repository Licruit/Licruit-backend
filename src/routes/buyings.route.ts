import express, { Router } from 'express';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getBuygins } from '../controllers/buyings.controller';
export const router: Router = express.Router();

router.get('/', wrapAsyncController(getBuygins));
