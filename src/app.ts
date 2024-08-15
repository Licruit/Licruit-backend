import './utils/sentry';
import { errorMiddleware } from './errorHandler/errorMiddleware';
import * as Sentry from '@sentry/node';
import express, { Express, NextFunction, Request, Response } from 'express';
const app: Express = express();
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './models';
import { StatusCodes } from 'http-status-codes';
import { sendSlackMessage } from './utils/slackWebHook';

app.use(express.json());
dotenv.config();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://licruit.site'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Refresh', 'Verify', 'Origin', 'Accept'],
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOptions));

import { router as userRouter } from './routes/users.route';
import { router as sectorRouter } from './routes/sectors.route';
import { router as liquorRouter } from './routes/liquors.route';
import { router as buyingRouter } from './routes/buyings.route';
import { router as orderRouter } from './routes/orders.route';
import { router as reviewRouter } from './routes/reviews.route';
import HttpException from './utils/httpExeption';
import cookieParser from 'cookie-parser';
import { morganMiddleware } from './config/morganMiddleware';

app.use(cookieParser());
app.use(morganMiddleware);

app.use('/users', userRouter);
app.use('/sectors', sectorRouter);
app.use('/liquors', liquorRouter);
app.use('/buyings', buyingRouter);
app.use('/orders', orderRouter);
app.use('/reviews', reviewRouter);

Sentry.setupExpressErrorHandler(app, {
  shouldHandleError(error) {
    process.env.NODE_ENV === 'production' && sendSlackMessage(error);
    return true;
  },
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpException(StatusCodes.NOT_FOUND, `${req.method} ${req.url} 라우터가 없습니다.`);

  next(error);
});

app.use(errorMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  console.log(`running on port ${PORT}`);
  await sequelize
    .authenticate()
    .then(async () => {
      console.log('DB 연결 성공');
    })
    .catch((e) => {
      console.log(e);
    });
});
