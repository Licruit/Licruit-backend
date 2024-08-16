export interface AllLiquorsDTO {
  search?: string;
  category?: number;
  minAlcohol?: number;
  maxAlcohol?: number;
  page?: number;
  sort?: string;
}

export interface LiquorReviewsDTO {
  page?: number;
  sort?: string;
}
