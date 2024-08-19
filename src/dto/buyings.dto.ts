export type SortType = 'ranking' | 'recent' | 'deadline';

export interface BuyingDTO {
  openDate: Date;
  deadline: Date;
  openTime: string;
  deliveryStart: Date;
  deliveryEnd: Date;
  totalMin: number;
  totalMax?: number;
  price: number;
  deliveryFee: number;
  freeDeliveryFee?: number;
  title: string;
  content: string;
  liquorId: number;
  companyNumber: string;
  regions: Array<string>;
}
