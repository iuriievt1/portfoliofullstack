import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length, Matches } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 24)
  @Matches(/^[a-zA-Z0-9_.-]+$/)
  username!: string;

  @ApiProperty()
  @IsString()
  @Length(8, 72)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;
}

