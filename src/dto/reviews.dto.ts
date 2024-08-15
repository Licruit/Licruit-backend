export interface ReviewDTO {
  buyingId: number;
  liquorId: number;
  companyNumber: string;
  score: number;
  title: string;
  content: string;
}

export interface ReviewInputDTO {
  buyingTitle: string;
  companyNumber: string;
  score: number;
  title: string;
  content: string;
}
