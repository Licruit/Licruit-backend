import { BuyingDTO } from '../dto/buyings.dto';
import { sequelize } from '../models';
import { Buying } from '../models/buyings.model';
import { DeliveryRegion } from '../models/deliveryRegions.model';
import { Region } from '../models/regions.model';

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
