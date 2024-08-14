import { col, literal, Op } from 'sequelize';
import { Order } from '../models/orders.model';
import { Buying } from '../models/buyings.model';
import { Liquor } from '../models/liquors.model';
import { State } from '../models/states.model';
import { sequelize } from '../models';

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
        [col('Buying->Liquor.img'), 'img'],
        [col('Buying.title'), 'title'],
        [col('Buying->Liquor.name'), 'liquorName'],
        [col('Buying.content'), 'content'],
        [col('State.status'), 'status'],
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
    const summary = await sequelize.query(
      `
      SELECT states.id, states.status, COUNT(all_orders.id) as statusCount
        FROM states
        LEFT OUTER JOIN (
	        SELECT *
	          FROM orders
	          WHERE orders.user_company_number = ${companyNumber} AND orders.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
          ) as all_orders
        ON states.id = all_orders.state_id
        WHERE states.id in (1, 2, 3, 4)
        GROUP BY states.id;
      `,
    );

    return summary[0];
  } catch (err) {
    throw new Error('참여한 공동구매 통계 조회 실패');
  }
};
