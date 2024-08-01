export interface RegisterDTO {
  companyNumber: string;
  password: string;
  businessName: string;
  contact: string;
  address: string;
  sectorId: number;
  isMarketing: boolean;
}

export interface LoginDTO {
  companyNumber: string;
  password: string;
}

export interface OtpRequestDTO {
  contact: string;
}

export interface OtpVerificationDTO {
  contact: string;
  otp: number;
}

export interface CompnayNumberCheckDTO {
  companyNumber: string;
}
