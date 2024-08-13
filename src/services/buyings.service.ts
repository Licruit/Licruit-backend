import { col, literal, Op } from 'sequelize';
import { SortType } from '../dto/buyings.dto';
import { Buying } from '../models/buyings.model';
import { Liquor } from '../models/liquors.model';
import { LiquorCategory } from '../models/liquorCategories.model';

export const selectAllBuyings = async (sort: SortType, page: number) => {
  try {
    const LIMIT = 8;
    const offset = (page - 1) * LIMIT;

    let orderByColumn = ['orderCount', 'DESC'];
    if (sort === 'recent') {
      orderByColumn = ['openDate', 'DESC'];
    } else if (sort === 'deadline') {
      orderByColumn = ['deadline', 'ASC'];
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
      order: [[orderByColumn[0], orderByColumn[1]]],
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
    throw new Error('공동구매 조회 실패');
  }
};
