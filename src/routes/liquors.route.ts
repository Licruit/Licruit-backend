import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getLiquorCategories } from '../controllers/liquors.controller';

router.get('/category', wrapAsyncController(getLiquorCategories));
