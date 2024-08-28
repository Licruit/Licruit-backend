import { BuyingDTO, SortType } from '../dto/buyings.dto';
import { sequelize } from '../models';
import { Buying } from '../models/buyings.model';
import { DeliveryRegion } from '../models/deliveryRegions.model';
import { Region } from '../models/regions.model';
import { col, fn, literal, Op, OrderItem, where, WhereOptions } from 'sequelize';
import { Liquor } from '../models/liquors.model';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Order } from '../models/orders.model';
import { Wholesaler } from '../models/wholesalers.model';
import { User } from '../models/users.model';
import { Blacklist } from '../models/blacklists.model';
import { State } from '../models/states.model';
import { getTodayDate } from '../utils/date';

export const addBuying = async ({
  openDate,
  deadline,
  openTime,
  deliveryStart,
  deliveryEnd,
  totalMin,
  totalMax,
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
        totalMax: totalMax || null,
        price: price,
        deliveryFee: deliveryFee,
        freeDeliveryFee: freeDeliveryFee || null,
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

export const selectAllBuyings = async (sort: SortType, page: number, region: number | undefined) => {
  try {
    const LIMIT = 8;
    const offset = (+page - 1) * LIMIT;

    let orderByColumn = [['orderCount', 'DESC']];
    if (sort === 'recent') {
      orderByColumn = [
        ['openDate', 'DESC'],
        ['openTime', 'DESC'],
      ];
    } else if (sort === 'deadline') {
      orderByColumn = [['deadline', 'ASC']];
    }

    const todayDateTime = getTodayDate('YYYY-MM-DD HH:mm:ss');
    const todayDate = todayDateTime.substring(0, 10);

    const buyings = await Buying.findAndCountAll({
      attributes: [
        [fn('DISTINCT', col('Buying.id')), 'id'],
        'id',
        'title',
        'content',
        'price',
        [literal('(SELECT IFNULL(SUM(quantity), 0) FROM orders WHERE orders.buying_id = Buying.id)'), 'orderCount'],
        [literal('DATEDIFF(Buying.deadline, :todayDate)'), 'leftDate'],
        [col('Liquor.img'), 'img'],
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
        {
          model: DeliveryRegion,
          attributes: [],
          where: region ? { regionId: region } : {},
        },
      ],
      where: literal(`CONCAT(open_date, ' ', open_time) <= :todayDateTime AND deadline >= :todayDate`),
      replacements: { todayDate, todayDateTime },
      order: orderByColumn as OrderItem[],
      limit: LIMIT,
      offset: offset,
      subQuery: false,
      distinct: true,
    });

    const buyingsAndPagination = {
      buyings: buyings.rows,
      pagination: {
        currentPage: +page,
        totalPage: Math.ceil(buyings.count / LIMIT),
      },
    };

    return buyingsAndPagination;
  } catch (err) {
    throw new Error('공동구매 전체 조회 실패');
  }
};

export const selectBuyingDetail = async (buyingId: number, companyNumber: string) => {
  try {
    const buying = await Buying.findOne({
      attributes: [
        'openDate',
        'openTime',
        'deadline',
        'deliveryStart',
        'deliveryEnd',
        'totalMin',
        [literal('IFNULL(Buying.total_max, 0)'), 'totalMax'],
        'price',
        'deliveryFee',
        [literal('IFNULL(Buying.free_delivery_fee, 0)'), 'freeDeliveryFee'],
        'title',
        'content',
        [literal('CAST(IFNULL(SUM(Orders.quantity), 0) AS SIGNED)'), 'orderCount'],
        [col('Liquor.id'), 'liquorId'],
        [col('Liquor.name'), 'liquorName'],
        [col('Liquor.img'), 'img'],
        [
          literal(
            'EXISTS(SELECT * FROM orders WHERE orders.buying_id = :buyingId AND user_company_number = :companyNumber)',
          ),
          'isParticipated',
        ],
      ],
      include: [
        {
          model: Liquor,
          attributes: [],
        },
        {
          model: Order,
          attributes: [],
        },
      ],
      where: {
        id: buyingId,
      },
      replacements: {
        buyingId: buyingId,
        companyNumber: companyNumber || '',
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

export const insertOrder = async (buyingId: number, companyNumber: string, quantity: number) => {
  try {
    await Order.create({
      buyingId: buyingId,
      userCompanyNumber: companyNumber,
      quantity: quantity,
      stateId: 1,
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

export const findBuying = async (buyingId: number) => {
  try {
    const buying = await Buying.findOne({
      where: {
        id: buyingId,
      },
    });

    return buying;
  } catch (err) {
    throw new Error('공동구매 조회 실패');
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

export const selectWholesalerBuyings = async (companyNumber: string, page: number, type: string) => {
  try {
    const LIMIT = 12;
    const offset = (page - 1) * LIMIT;
    const today = new Date();

    let whereCondition: WhereOptions = { wholesalerCompanyNumber: companyNumber };
    if (type === 'achievement' || type === 'shortfall') {
      const operator = type === 'achievement' ? '>=' : '<';

      whereCondition = {
        ...whereCondition,
        [Op.and]: literal(`
        (SELECT IF(SUM(quantity) IS NULL, 0, SUM(quantity)) FROM orders WHERE orders.buying_id = Buying.id) ${operator} Buying.total_min
      `),
      };
    }

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
      where: whereCondition,
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
        [col('User.business_name'), 'businessName'],
        [col('User.contact'), 'contact'],
        [col('Buying->Liquor.name'), 'liquorName'],
        [col('Buying.price'), 'liquorPrice'],
        [
          literal(
            `CASE WHEN State.status = '신청' THEN '신청' WHEN State.status IN ('승인대기', '배송중', '배송완료', '마감') THEN '확정' WHEN State.status = '취소' THEN '취소' WHEN State.status = '경고' THEN '경고' END`,
          ),
          'status',
        ],
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

export const selectOrderWholesaler = async (orderId: number) => {
  try {
    const buyingWholesaler = await Buying.findOne({
      include: [
        {
          model: Order,
          attributes: [],
          where: { id: orderId },
        },
      ],
      attributes: ['wholesalerCompanyNumber'],
    });

    return buyingWholesaler?.getDataValue('wholesalerCompanyNumber');
  } catch (err) {
    throw new Error('잘못된 주문번호 입니다.');
  }
};

export const selectBuyingWholesaler = async (buyingId: number) => {
  try {
    const buyingWholesaler = await Buying.findOne({
      attributes: ['wholesalerCompanyNumber'],
      where: { id: buyingId },
    });

    return buyingWholesaler?.getDataValue('wholesalerCompanyNumber');
  } catch (err) {
    throw new Error('잘못된 공동구매 번호 입니다.');
  }
};

export const selectUserInfo = async (orderId: number) => {
  try {
    const userInfo = await Order.findOne({
      attributes: [
        'createdAt',
        [col('User.business_name'), 'businessName'],
        [col('User.contact'), 'contact'],
        [col('User.address'), 'address'],
        [col('Buying->Liquor.name'), 'liquorName'],
        [col('Buying.price'), 'pricePerBottle'],
        [
          literal(
            '(SELECT IF(buyings.free_delivery_fee <= (Buying.price * Order.quantity), (Buying.price * Order.quantity), (Buying.price * Order.quantity) + buyings.delivery_fee)FROM buyings WHERE buyings.id = Order.buying_id)',
          ),
          'totalPrice',
        ],
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
      ],
      where: { id: orderId },
    });

    return userInfo;
  } catch (err) {
    throw new Error('구매자 정보 조회 실패');
  }
};

export const updateAllOrderState = async (buyingId: number) => {
  try {
    await Order.update(
      {
        stateId: 3,
      },
      { where: { buyingId: buyingId } },
    );
  } catch (err) {
    throw new Error('공동구매 전체 주문자 상태 업데이트 실패');
  }
};

export const updateOrderState = async (buyingId: number, orderId: number) => {
  try {
    await Order.update(
      {
        stateId: 3,
      },
      { where: { id: orderId, buyingId: buyingId } },
    );
  } catch (err) {
    throw new Error('공동구매 주문자 상태 업데이트 실패');
  }
};

export const deleteBuying = async (buyingId: number) => {
  try {
    const today = getTodayDate('YYYY-MM-DD');

    const result = await Buying.destroy({ where: { id: buyingId, deadline: { [Op.gt]: today } } });
    return result;
  } catch (err) {
    throw new Error('공동구매 삭제 실패');
  }
};

export const deleteOrder = async (orderId: number) => {
  try {
    await Order.update(
      {
        stateId: 6,
      },
      { where: { id: orderId } },
    );
  } catch (err) {
    throw new Error('공동구매 주문 취소 실패');
  }
};

export const selectOrderInfo = async (orderId: number) => {
  try {
    const orderInfo = await Order.findOne({
      attributes: ['buyingId', 'userCompanyNumber'],
      where: { id: orderId },
    });

    return orderInfo;
  } catch (err) {
    throw new Error('유저 조회 실패');
  }
};

export const insertBlacklist = async (
  buyingId: number,
  userCompanyNumber: string,
  wholesalerCompanyNumber: string,
  orderId: number,
) => {
  const transaction = await sequelize.transaction();
  try {
    await Blacklist.create(
      {
        buyingId: buyingId,
        userCompanyNumber: userCompanyNumber,
        wholesalerCompanyNumber: wholesalerCompanyNumber,
      },
      { transaction: transaction },
    );

    await Order.update(
      {
        stateId: 7,
      },
      { where: { id: orderId } },
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new Error('블랙리스트 추가 실패');
  }
};
