import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EnvService } from "../config/env.service";

@Injectable()
export class RiskService {
  constructor(private readonly prisma: PrismaService, private readonly env: EnvService) {}

  async evaluateTransfer(input: { userId: string; amountMinor: bigint; isNewBeneficiary: boolean; transferId?: string }) {
    const flags: string[] = [];
    if (input.amountMinor >= this.env.riskLargeTransferMinor) flags.push("LARGE_TRANSFER");
    if (input.isNewBeneficiary && input.amountMinor >= this.env.riskNewBeneficiaryMinor) flags.push("NEW_BENEFICIARY_LARGE");

    if (!flags.length) return { flagged: false, flags };

    for (const flag of flags) {
      await this.prisma.riskEvent.create({
        data: {
          userId: input.userId,
          transferId: input.transferId,
          severity: "HIGH",
          code: flag,
          title: flag.replaceAll("_", " "),
          description: `Transfer flagged by baseline rule ${flag}.`
        }
      });
    }

    return { flagged: true, flags };
  }

  async listOpen() {
    return this.prisma.riskEvent.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } });
  }
}
