import { IsString,  IsOptional, IsNotEmpty, IsArray, ValidateNested, IsNumber } from "class-validator";
import { UserCreateDto } from './user-create.dto';
import { Type } from 'class-transformer';

export class AgencyCreateDto{

    @IsNotEmpty({message: "Agency name should not be empty"})
    @IsString({message: "Enter valid agency name"})
    agencyName: string;
    
    @IsOptional()
    @IsString({message: "Enter valid location"})
    location: string;

    @IsOptional()
    @IsString({message: "Enter valid other details"})
    otherDetails: string;

    @IsOptional()
    @IsArray({message:"Users must be an array"})
    @ValidateNested({each:true})
    @Type(() => UserCreateDto)
    users: UserCreateDto[];    

    @IsOptional()
    @IsArray({message:"Deleted must be an array"})
    @IsNumber({}, {each: true,message:"Deleted must be number"})
    deleted: number[];
}