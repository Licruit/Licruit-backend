import { RegisterDTO } from "../dto/users.dto";
import { User } from "../models/users.model";
import { passwordEncryption } from "../utils/encryption";

export const findUser = async (companyNumber: string) => {
    try {
        const user = await User.findOne({
            where: { company_number: companyNumber }
        });

        return user;
    } catch (err) {
        throw new Error('사용자 조회 실패');
    }
}

export const insertUser = async (registerDTO: RegisterDTO) => {
    try {
        const { salt, hashPassword } = passwordEncryption(registerDTO.password);

        const newUser = await User.create({
            company_number: registerDTO.companyNumber,
            salt: salt,
            password: hashPassword,
            business_name: registerDTO.businessName,
            contact: registerDTO.contact,
            address: registerDTO.address,
            sector_id: registerDTO.sectorId,
            img: 'default'
        })

        return newUser;
    } catch {
        throw new Error('사용자 생성 실패');
    }
}