import request from 'supertest';
import { app } from '../app';

describe('Liquor API Test', () => {
  it('GET /liquors/category - 주류 카테고리 조회 테스트', async () => {
    const res = await request(app).get('/liquors/category');

    expect(res.statusCode).toBe(200);
  });

  it('GET /liquors/:id - 주류 정보 조회 테스트', async () => {
    const res = await request(app).get('/liquors/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      name: '이동 생 쌀 막걸리',
      img: 'https://thesool.com/common/imageView.do?targetId=PR00000050&targetNm=PRODUCT',
      categoryId: 1,
      ingredient: '정제수, 백미, 팽화미, 입국, 아스파탐 등',
      alcohol: '6.0',
      volume: 750,
      award: '',
      etc: '',
      description:
        '포천의 이동주조는 군사지역인 탓에 군인들이 거주하는 경우가 많았는데, 이들이 제대한 후에도 이동막걸리를 잊지 못해 찾아오며 이름을 알리기 시작했다. 쌀과 쌀 누룩을 이용해 막걸리 빛이 희고 팽화미 특유의 고소한 맛과 향미가 있는 것이 특징이다.',
      food: '적절한 산미가 음식맛을 도드라져 갈비찜과 어울린다.',
      brewery: '이동주조',
      address: '경기도 포천시 이동면 화동로 2466',
      homepage: 'http://edongricewine.modoo.at/',
      contact: '031-535-2800',
      categoryName: '탁주',
      likes: 2,
      liked: 0,
      reviewCount: 2,
      reviewAvg: 2.5,
      buyings: [],
    });
  });

  it('GET /liquors/:id - 존재하지 않는 주류 조회 테스트', async () => {
    const res = await request(app).get('/liquors/4000');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 404,
      message: '존재하지 않는 전통주입니다.',
    });
  });
});
