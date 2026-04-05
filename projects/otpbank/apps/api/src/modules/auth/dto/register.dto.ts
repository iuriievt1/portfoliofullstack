import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z -]{1,100}$/)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z -]{1,100}$/)
  lastName?: string;
}
