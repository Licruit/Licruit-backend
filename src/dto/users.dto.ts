export interface RegisterDTO {
    companyNumber: string;
    password: string;
    businessName: string;
    contact: string;
    address: string;
    sectorId: number;
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