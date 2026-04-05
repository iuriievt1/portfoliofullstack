import { IsEnum, IsOptional, IsString, Matches } from "class-validator";

export class CreateTransferDto {
  @IsString()
  sourceAccountId!: string;

  @IsString()
  destinationAccountId!: string;

  @IsString()
  @Matches(/^\d+$/)
  amountMinor!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(["INTERNAL", "OWN_ACCOUNT"] as const)
  type!: "INTERNAL" | "OWN_ACCOUNT";
}
