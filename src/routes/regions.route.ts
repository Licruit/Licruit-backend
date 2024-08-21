import express, { Router } from 'express';
export const router: Router = express.Router();
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { getRegions } from '../controllers/regions.controller';

router.get('/', wrapAsyncController(getRegions));
