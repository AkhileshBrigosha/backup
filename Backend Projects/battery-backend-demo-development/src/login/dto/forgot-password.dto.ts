import { IsEmail, IsNotEmpty } from 'class-validator';
export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail({},{message: 'Email should be valid'})
    email: string;
}
