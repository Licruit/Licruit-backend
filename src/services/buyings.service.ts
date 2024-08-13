import { col, literal, Op, OrderItem } from 'sequelize';
import { SortType } from '../dto/buyings.dto';
import { Buying } from '../models/buyings.model';
import { Liquor } from '../models/liquors.model';
import { LiquorCategory } from '../models/liquorCategories.model';
import { Order } from '../models/orders.model';
import { Wholesaler } from '../models/wholesalers.model';
import { User } from '../models/users.model';

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
    console.log(err);
    throw new Error('공동구매 상세 조회 실패');
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
    console.log(err);
    throw new Error('도매업체 정보 조회 실패');
  }
};
