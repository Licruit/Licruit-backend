import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getAllLiquors, getLiquorCategories, likeLiquor, unlikeLiquor } from '../controllers/liquors.controller';
import { pageValidate } from '../validators/liquors.validator';
import { validate } from '../validators/validate';
import { accessTokenValidate } from '../auth';

router.get('/', [pageValidate, validate], wrapAsyncController(getAllLiquors));

router.get('/category', wrapAsyncController(getLiquorCategories));

router.post('/:liquorId/likes', [accessTokenValidate], wrapAsyncController(likeLiquor));

router.delete('/:liquorId/likes', [accessTokenValidate], wrapAsyncController(unlikeLiquor));
