import { IsString, Matches, MinLength } from "class-validator";

export class ManualAdjustmentDto {
  @IsString()
  accountId!: string;

  @IsString()
  @Matches(/^-?\d+$/)
  amountMinor!: string;

  @IsString()
  @MinLength(8)
  reason!: string;
}
