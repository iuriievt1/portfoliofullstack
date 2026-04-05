import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.account.findMany({
      where: { userId, status: { not: "CLOSED" } },
      orderBy: { createdAt: "asc" },
      include: { cards: true }
    });
  }

  async getForUser(userId: string, accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { cards: true, transactionViews: { orderBy: { bookedAt: "desc" }, take: 20 } }
    });
    if (!account) throw new NotFoundException("Account not found");
    if (account.userId !== userId) throw new ForbiddenException("Forbidden");
    return account;
  }

  async listBeneficiaries(userId: string) {
    return this.prisma.beneficiary.findMany({
      where: { ownerUserId: userId, status: "ACTIVE" },
      include: { beneficiaryAccount: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async cardsForUser(userId: string) {
    return this.prisma.card.findMany({
      where: { account: { userId } },
      include: { account: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async documentsForUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async transactionsForUser(userId: string) {
    return this.prisma.transactionView.findMany({
      where: { userId },
      orderBy: { bookedAt: "desc" },
      take: 200
    });
  }
}
