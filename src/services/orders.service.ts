import { col, literal, Op } from 'sequelize';
import { Order } from '../models/orders.model';
import { Buying } from '../models/buyings.model';
import { Liquor } from '../models/liquors.model';
import { State } from '../models/states.model';

export const selectAllOrders = async (companyNumber: string, status: number | undefined, page: number) => {
  try {
    const LIMIT = 8;
    const offset = (page - 1) * LIMIT;

    const statusWhereCondition: { stateId?: number } = {};
    if (status) {
      statusWhereCondition.stateId = status;
    }

    const orders = await Order.findAndCountAll({
      attributes: [
        'id',
        [literal('DATE(DATE_ADD(Order.created_at, INTERVAL 9 HOUR))'), 'createdAt'],
        [col('Buying.id'), 'buyingId'],
        [col('Buying->Liquor.img'), 'img'],
        [col('Buying.title'), 'title'],
        [col('Buying->Liquor.name'), 'liquorName'],
        [col('Buying.content'), 'content'],
        [col('State.status'), 'status'],
        [literal('EXISTS(SELECT * FROM reviews WHERE reviews.order_id = Order.id)'), 'isWroteReview'],
        [
          literal(
            'IF(Buying.free_delivery_fee <= Buying.price * Order.quantity, 0, Buying.delivery_fee) + Buying.price * Order.quantity',
          ),
          'totalPrice',
        ],
        'quantity',
      ],
      include: [
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
      where: {
        ...statusWhereCondition,
        userCompanyNumber: companyNumber,
        createdAt: { [Op.gte]: literal('DATE_SUB(NOW(), INTERVAL 1 YEAR)') },
      },
      limit: LIMIT,
      offset: offset,
    });

    const ordersAndPagination = {
      orders: orders.rows,
      pagination: {
        currentPage: +page,
        totalPage: Math.ceil(orders.count / LIMIT),
      },
    };

    return ordersAndPagination;
  } catch (err) {
    throw new Error('공동구매 참여 목록 조회 실패');
  }
};

export const selectOrderSummary = async (companyNumber: string) => {
  try {
    const summary = await Order.findAll({
      attributes: [
        [col('State.id'), 'id'],
        [col('State.status'), 'status'],
        [literal('COUNT(IF(user_company_number = :companyNumber, 1, null))'), 'statusCount'],
      ],
      include: [
        {
          model: State,
          attributes: [],
          right: true,
        },
      ],
      replacements: {
        companyNumber: companyNumber,
      },
      where: literal(
        '(Order.created_at is NULL OR Order.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)) AND State.id IN (1, 2, 3, 4)',
      ),
      group: 'State.id',
    });

    return summary;
  } catch (err) {
    throw new Error('참여한 공동구매 현황 조회 실패');
  }
};

export const isOrderOwner = async (companyNumber: string, orderId: number) => {
  try {
    const order = await Order.findOne({
      where: {
        id: orderId,
      },
    });

    return order && order.userCompanyNumber === companyNumber ? true : false;
  } catch (err) {
    throw new Error('주문 접근 권한 조회 실패');
  }
};

export const updateCanceledOrder = async (orderId: number) => {
  try {
    await Order.update(
      {
        stateId: 6,
        updatedAt: new Date(),
      },
      {
        where: {
          id: orderId,
        },
      },
    );
  } catch (err) {
    throw new Error('주문 취소 실패');
  }
};

export const findOrder = async (orderId: number) => {
  try {
    const order = await Order.findOne({
      include: [
        {
          model: Buying,
          attributes: [],
        },
      ],
      where: {
        id: orderId,
      },
    });

    return order;
  } catch (err) {
    throw new Error('주문 조회 실패');
  }
};
