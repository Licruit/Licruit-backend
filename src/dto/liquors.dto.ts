export interface AllLiquorsDTO {
  search?: string;
  category?: number;
  minAlcohol?: number;
  maxAlcohol?: number;
  page?: number;
}

export interface LiquorReviewsDTO {
  page?: number;
  sort?: string;
}
