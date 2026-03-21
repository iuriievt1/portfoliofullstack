import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CrowdLevel, NoiseLevel } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min
} from "class-validator";

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  placeId!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 400)
  text!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  vibe!: number;

  @ApiProperty({ enum: CrowdLevel })
  @IsEnum(CrowdLevel)
  crowdLevel!: CrowdLevel;

  @ApiProperty({ enum: NoiseLevel })
  @IsEnum(NoiseLevel)
  noiseLevel!: NoiseLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  waitTimeMin?: number;

  @ApiProperty({ description: "How long the post should remain active.", minimum: 1, maximum: 24 })
  @IsInt()
  @Min(1)
  @Max(24)
  expiresInHours!: number;
}
