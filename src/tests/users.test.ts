import request from 'supertest';
import express, { Express } from 'express';
import { router as userRouter } from '../routes/users.route';
const app: Express = express();
import dotenv from 'dotenv';

app.use(express.json());
dotenv.config();

app.use('/users', userRouter);

describe('User API', () => {
  it('POST /users/login - 로그인 테스트', async () => {
    const res = await request(app).post('/users/login').send({
      companyNumber: '3221401357',
      password: 'abc123',
    });

    expect(res.statusCode).toEqual(200);
  });
});
