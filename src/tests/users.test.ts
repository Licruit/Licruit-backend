import request from 'supertest';
import express, { Express, NextFunction, Request, Response } from 'express';
const app: Express = express();
import dotenv from 'dotenv';
import HttpException from '../utils/httpExeption';
import { errorMiddleware } from '../errorHandler/errorMiddleware';

app.use(express.json());
dotenv.config();

import { router as userRouter } from '../routes/users.route';
import { StatusCodes } from 'http-status-codes';
import { sequelize } from '../models';

app.use('/users', userRouter);

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

describe('User API', () => {
  it('POST /users/login - 로그인 테스트', async () => {
    const res = await request(app).post('/users/login').send({
      companyNumber: '3221401357',
      password: 'abc123',
    });

    expect(res.statusCode).toBe(200);
  });
});
