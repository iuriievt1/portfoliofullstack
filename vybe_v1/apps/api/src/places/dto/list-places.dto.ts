import { ApiPropertyOptional } from "@nestjs/swagger";
import { PlaceType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class ListPlacesDto {
  @ApiPropertyOptional({ default: "Prague" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: PlaceType })
  @IsOptional()
  @IsEnum(PlaceType)
  type?: PlaceType;
}

