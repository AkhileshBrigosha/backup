import { UserRole } from "../users/enums/user.enum";

export interface JwtPayload{
    id: number,
    name: string,
    email: string,
    phone: string,
    role: UserRole[],
}