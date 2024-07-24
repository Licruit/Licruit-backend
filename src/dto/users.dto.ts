export interface RegisterDTO {
    companyNumber: string;
    password: string;
    businessName: string;
    contact: string;
    address: string;
    sectorId: number;
}

export interface OtpRequestDTO {
    contact: string;
}

export interface OtpVerificationDTO {
    contact: string;
    otp: number;
}