import request from 'supertest';
import { app } from '../app';

describe('Liquor API Test', () => {
  it('GET /liquors/category - 주류 카테고리 조회 테스트', async () => {
    const res = await request(app).get('/liquors/category');

    expect(res.statusCode).toBe(200);
  });
});
