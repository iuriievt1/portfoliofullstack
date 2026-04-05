import { IsEnum, IsString } from "class-validator";

export class RequestOtpDto {
  @IsEnum(["EMAIL_VERIFICATION", "PHONE_VERIFICATION", "LOGIN_2FA", "PASSWORD_RESET", "STEP_UP"] as const)
  purpose!: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "LOGIN_2FA" | "PASSWORD_RESET" | "STEP_UP";

  @IsString()
  destination!: string;
}
