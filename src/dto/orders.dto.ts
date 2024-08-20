import { OrdersAttributes } from '../models/orders.model';

export interface AllOrdersDTO {
  status?: number;
  page?: number;
}

export interface OwnerAndDeadlineVO extends OrdersAttributes {
  deadline?: string;
}
