import { IsString, IsNotEmpty, IsNumber, IsNumberString } from "class-validator";

export class UpdatePasswordDto {

    @IsNotEmpty({message: "User Id required"})
    @IsNumberString({}, {message: "User Id should be a number"})
    userId: number;

    @IsNotEmpty({message: "Please type in a password"})
    @IsString()
    password: string;
}