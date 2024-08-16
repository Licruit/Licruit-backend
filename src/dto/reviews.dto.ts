export interface ReviewDTO {
  orderId: number;
  liquorId: number;
  companyNumber: string;
  score: number;
  title: string;
  content: string;
}

export interface ReviewInputDTO {
  orderId: number;
  score: number;
  title: string;
  content: string;
}
