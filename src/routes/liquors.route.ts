import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getAllLiquors, getLiquorCategories } from '../controllers/liquors.controller';
import { pageValidate } from '../validators/liquors.validator';
import { validate } from '../validators/validate';

router.get('/', [pageValidate, validate], wrapAsyncController(getAllLiquors));

router.get('/category', wrapAsyncController(getLiquorCategories));
