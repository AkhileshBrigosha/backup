import { IsNumberString, IsNotEmpty, IsString } from "class-validator";

export class CheckTokenDto{
    
    @IsNotEmpty({message: "User ID is required"})
    @IsNumberString({}, {message: "User ID should be a number"})
    userId: number;

    @IsNotEmpty({message: "Token is missing"})
    @IsString({message: "Token must be a string"})
    token: string

}