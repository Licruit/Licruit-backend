import { BuyingDTO, SortType } from '../dto/buyings.dto';
import { sequelize } from '../models';
import { Buying } from '../models/buyings.model';
import { DeliveryRegion } from '../models/deliveryRegions.model';
import { Region } from '../models/regions.model';
import { col, literal, Op, OrderItem, WhereOptions } from 'sequelize';
import { Liquor } from '../models/liquors.model';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Order } from '../models/orders.model';
import { Wholesaler } from '../models/wholesalers.model';
import { User } from '../models/users.model';
import { Blacklist } from '../models/blacklists.model';
import { State } from '../models/states.model';

export const addBuying = async ({
  openDate,
  deadline,
  openTime,
  deliveryStart,
  deliveryEnd,
  totalMin,
  totalMax,
  individualMin,
  price,
  deliveryFee,
  freeDeliveryFee,
  title,
  content,
  liquorId,
  companyNumber,
  regions,
}: BuyingDTO) => {
  const transaction = await sequelize.transaction();
  try {
    const newBuying = await Buying.create(
      {
        openDate: openDate,
        deadline: deadline,
        openTime: openTime,
        deliveryStart: deliveryStart,
        deliveryEnd: deliveryEnd,
        totalMin: totalMin,
        totalMax: totalMax,
        individualMin: individualMin,
        price: price,
        deliveryFee: deliveryFee,
        freeDeliveryFee: freeDeliveryFee,
        title: title,
        content: content,
        liquorId: liquorId,
        wholesalerCompanyNumber: companyNumber,
      },
      { transaction: transaction },
    );

    const buyingId = newBuying.id;
    for (const regionName of regions) {
      const region = await Region.findOne({ where: { name: regionName } });

      if (!region) {
        throw new Error(`${region} 조회 실패`);
      }

      await DeliveryRegion.create(
        {
          buyingId: buyingId,
          regionId: region.id,
        },
        { transaction: transaction },
      );
    }
    await transaction.commit();
    return newBuying;
  } catch (err) {
    await transaction.rollback();

    if (err instanceof Error) {
      if (err.message.includes('조회 실패')) {
        throw new Error(`공동구매 올리기 실패: ${err.message}`);
      }

      throw new Error('공동구매 올리기 실패');
    }
  }
};

export const selectAllBuyings = async (sort: SortType, page: number) => {
  try {
    const LIMIT = 8;
    const offset = (page - 1) * LIMIT;

    let orderByColumn = [['orderCount', 'DESC']];
    if (sort === 'recent') {
      orderByColumn = [
        ['openDate', 'DESC'],
        ['openTime', 'DESC'],
      ];
    } else if (sort === 'deadline') {
      orderByColumn = [['deadline', 'ASC']];
    }

    const today = new Date();
    const buyings = await Buying.findAndCountAll({
      attributes: [
        'id',
        'title',
        'content',
        'price',
        [literal('(SELECT SUM(quantity) FROM orders WHERE orders.buying_id = Buying.id)'), 'orderCount'],
        [literal('DATEDIFF(Buying.deadline, :today)'), 'leftDate'],
        [col('Liquor.name'), 'liquorName'],
        [col('Liquor.alcohol'), 'alcohol'],
        [col('Liquor.volume'), 'volume'],
        [col('Liquor->LiquorCategory.name'), 'categoryName'],
      ],

      include: [
        {
          model: Liquor,
          attributes: [],
          include: [
            {
              model: LiquorCategory,
              attributes: [],
            },
          ],
        },
      ],
      where: {
        openDate: { [Op.lte]: today },
        deadline: { [Op.gte]: today },
      },
      replacements: { today: today },
      order: orderByColumn as OrderItem[],
      limit: LIMIT,
      offset: offset,
    });

    const buyingsAndPagination = {
      buyings: buyings.rows,
      pagination: {
        currentPage: page,
        totalPage: Math.ceil(buyings.count / LIMIT),
      },
    };

    return buyingsAndPagination;
  } catch (err) {
    throw new Error('공동구매 전체 조회 실패');
  }
};

export const selectBuyingDetail = async (buyingId: number) => {
  try {
    const buying = await Buying.findOne({
      attributes: {
        include: [
          [literal('SUM(Orders.quantity)'), 'orderCount'],
          [col('Liquor.name'), 'liquorName'],
          [col('Liquor->LiquorCategory.name'), 'categoryName'],
          [col('Liquor.ingredient'), 'ingredient'],
          [col('Liquor.alcohol'), 'alcohol'],
          [col('Liquor.volume'), 'volume'],
          [col('Liquor.award'), 'award'],
          [col('Liquor.etc'), 'etc'],
          [col('Liquor.description'), 'description'],
          [col('Liquor.food'), 'food'],
          [col('Liquor.brewery'), 'brewery'],
          [col('Liquor.address'), 'address'],
          [col('Liquor.homepage'), 'homepage'],
          [col('Liquor.contact'), 'contact'],
        ],
        exclude: ['id', 'openTime', 'totalMax', 'liquorId', 'wholesalerCompanyNumber', 'createdAt'],
      },
      include: [
        {
          model: Liquor,
          attributes: [],
          include: [
            {
              model: LiquorCategory,
              attributes: [],
            },
          ],
        },
        {
          model: Order,
          attributes: [],
        },
      ],
      where: {
        id: buyingId,
      },
      group: 'Buying.id',
    });

    return buying;
  } catch (err) {
    throw new Error('공동구매 상세 조회 실패');
  }
};

export const selectDeliveryAvaliableAreas = async (buyingId: number) => {
  try {
    const deliveryAvaliableRegions = await DeliveryRegion.findAll({
      attributes: [[col('Region.name'), 'regionName']],
      include: [
        {
          model: Region,
          attributes: [],
        },
      ],
      where: {
        buyingId: buyingId,
      },
    });

    const regionArray = deliveryAvaliableRegions.map((region) => {
      return Object.values(region.dataValues)[0];
    });

    return regionArray;
  } catch (err) {
    throw new Error('배송 가능 지역 조회 실패');
  }
};

export const selectOneBuying = async (buyingId: number) => {
  try {
    const buying = await Buying.findOne({ where: { id: buyingId } });

    return buying;
  } catch (err) {
    throw new Error('공동구매 개별 조회 실패');
  }
};

export const insertOrder = async (buyingId: number, companyNumber: string, quantity: number) => {
  try {
    await Order.create({
      buyingId: buyingId,
      userCompanyNumber: companyNumber,
      quantity: quantity,
      stateId: 1,
      updatedAt: new Date(),
    });
  } catch (err) {
    throw new Error('공동구매 참여 실패');
  }
};

export const selectWholesalerInfo = async (wholesalerCompanyNumber: string) => {
  try {
    const wholesalerInfo = await Wholesaler.findOne({
      attributes: [
        [col('User.img'), 'img'],
        [col('User.business_name'), 'businessName'],
        'introduce',
        'homepage',
        [literal('SUM(`Buyings->Orders`.quantity)'), 'totalSales'],
      ],
      include: [
        {
          model: User,
          attributes: [],
        },
        {
          model: Buying,
          attributes: [],
          include: [
            {
              model: Order,
              attributes: [],
            },
          ],
        },
      ],
      where: {
        userCompanyNumber: wholesalerCompanyNumber,
      },
      group: 'userCompanyNumber',
    });

    return wholesalerInfo;
  } catch (err) {
    throw new Error('도매업체 정보 조회 실패');
  }
};

export const findBuying = async (buyingTitle: string) => {
  try {
    const buyingInfo = await Buying.findOne({
      attributes: ['id', ['liquor_id', 'liquorId']],
      where: { title: buyingTitle },
    });
    return buyingInfo;
  } catch (err) {
    throw new Error('구매 정보 조회 실패');
  }
};

export const selectBlacklistCount = async (companyNumber: string) => {
  try {
    const blacklistCount = await Blacklist.count({
      where: {
        userCompanyNumber: companyNumber,
      },
    });

    return blacklistCount;
  } catch (err) {
    throw new Error('신고 횟수 조회 실패');
  }
};

export const selectBuyingSummary = async (companyNumber: string) => {
  try {
    const summary = await Buying.findOne({
      attributes: [
        [literal(`COUNT(DISTINCT id)`), 'openBuying'],
        [
          literal(
            `COALESCE((SELECT SUM(quantity) FROM orders WHERE buying_id IN(SELECT id FROM buyings WHERE wholesaler_company_number = :companyNumber)), 0)`,
          ),
          'liquorSum',
        ],
        [
          literal(
            `SUM(CASE WHEN COALESCE((SELECT SUM(quantity) FROM orders WHERE buying_id = Buying.id), 0) < Buying.total_min THEN 1 ELSE 0 END)`,
          ),
          'shortfall',
        ],
        [
          literal(
            `SUM(CASE WHEN (SELECT SUM(quantity) FROM orders WHERE buying_id = Buying.id) >= Buying.total_min AND Buying.deadline < NOW() THEN 1 ELSE 0 END)`,
          ),
          'achievement',
        ],
      ],
      where: literal(
        `(wholesaler_company_number = :companyNumber) AND (Buying.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR))`,
      ),
      replacements: {
        companyNumber,
      },
      raw: true,
    });

    return summary;
  } catch (err) {
    throw new Error('도매업자 공동구매 현황 조회 실패');
  }
};

export const selectWholesalerBuyings = async (companyNumber: string, page: number) => {
  try {
    const LIMIT = 12;
    const offset = (page - 1) * LIMIT;
    const today = new Date();

    const buyings = await Buying.findAndCountAll({
      attributes: [
        'id',
        'title',
        'content',
        [literal('DATEDIFF(Buying.deadline, :today)'), 'leftDate'],
        [col('Liquor.name'), 'liquorName'],
        [col('Liquor.img'), 'liquorImg'],
        [
          literal(
            '(SELECT IF(SUM(quantity) IS null, 0, SUM(quantity)) FROM orders WHERE orders.buying_id = Buying.id)',
          ),
          'orderCount',
        ],
      ],
      include: [
        {
          model: Liquor,
          attributes: [],
        },
      ],
      where: {
        wholesalerCompanyNumber: companyNumber,
      },
      replacements: { today: today },
      limit: LIMIT,
      offset: offset,
    });

    const buyingsAndPagination = {
      buyings: buyings.rows,
      pagination: {
        currentPage: page,
        totalPage: Math.ceil(buyings.count / LIMIT),
      },
    };
    return buyingsAndPagination;
  } catch (err) {
    throw new Error('도매업자 공동구매 목록 조회 실패');
  }
};

export const selectBuyingOrderList = async (buyingId: number, page: number, type: string) => {
  try {
    const LIMIT = 12;
    const offset = (page - 1) * LIMIT;

    const whereCondition: WhereOptions = {
      buyingId,
    };

    if (type === 'cancel') {
      whereCondition['buyingId'] = buyingId;
      whereCondition['stateId'] = 6;
    }

    const orderList = await Order.findAndCountAll({
      attributes: [
        'id',
        'userCompanyNumber',
        [col('User.contact'), 'contact'],
        [col('Buying->Liquor.name'), 'liquorName'],
        [col('Buying.price'), 'liquorPrice'],
        [col('State.status'), 'status'],
      ],
      include: [
        {
          model: User,
          attributes: [],
        },
        {
          model: Buying,
          attributes: [],
          include: [
            {
              model: Liquor,
              attributes: [],
            },
          ],
        },
        {
          model: State,
          attributes: [],
        },
      ],
      where: whereCondition,
      limit: LIMIT,
      offset: offset,
    });

    const orderListAndPagination = {
      orderList: orderList.rows,
      pagination: {
        currentPage: page,
        totalPage: Math.ceil(orderList.count / LIMIT),
      },
    };

    return orderListAndPagination;
  } catch (err) {
    throw new Error('도매업자 공동구매 주문자 리스트 조회 실패');
  }
};
