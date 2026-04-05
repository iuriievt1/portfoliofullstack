import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditActorType, LedgerLineDirection, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { RiskService } from "../risk/risk.service";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { ManualAdjustmentDto } from "./dto/manual-adjustment.dto";

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly risk: RiskService
  ) {}

  private async reserveIdempotency(actorUserId: string, scope: string, key: string) {
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { actorUserId_scope_key: { actorUserId, scope, key } }
    });
    if (existing?.status === "COMPLETED" && existing.responseJson) {
      return { replay: true as const, payload: existing.responseJson };
    }
    if (existing && existing.status === "PENDING") {
      throw new ConflictException("Request with this idempotency key is already processing");
    }
    const item = await this.prisma.idempotencyKey.upsert({
      where: { actorUserId_scope_key: { actorUserId, scope, key } },
      update: { status: "PENDING" },
      create: {
        actorUserId,
        scope,
        key,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    return { replay: false as const, item };
  }

  private async finalizeIdempotency(id: string, response: Record<string, unknown>) {
    await this.prisma.idempotencyKey.update({
      where: { id },
      data: { status: "COMPLETED", responseJson: response as Prisma.InputJsonValue }
    });
  }

  private async failIdempotency(id: string) {
    await this.prisma.idempotencyKey.update({
      where: { id },
      data: { status: "FAILED" }
    }).catch(() => undefined);
  }

  private async lockAccounts(tx: Prisma.TransactionClient, accountIds: string[]) {
    const inList = Prisma.join(accountIds.map((id) => Prisma.sql`${id}`));
    await tx.$queryRaw`SELECT id FROM "Account" WHERE id IN (${inList}) FOR UPDATE`;
  }

  async createTransfer(
    userId: string,
    dto: CreateTransferDto,
    idempotencyKey: string,
    context: { ipAddress?: string; requestId?: string }
  ) {
    const amountMinor = BigInt(dto.amountMinor);
    if (amountMinor <= 0n) throw new BadRequestException("amountMinor must be positive");
    if (!idempotencyKey) throw new BadRequestException("Idempotency-Key is required");

    const idem = await this.reserveIdempotency(userId, "transfer", idempotencyKey);
    if (idem.replay) return idem.payload;

    try {
      const transferResult = await this.prisma.$transaction(async (tx) => {
        await this.lockAccounts(tx, [dto.sourceAccountId, dto.destinationAccountId]);

        const [source, destination] = await Promise.all([
          tx.account.findUnique({ where: { id: dto.sourceAccountId }, include: { ledgerAccount: true } }),
          tx.account.findUnique({ where: { id: dto.destinationAccountId }, include: { ledgerAccount: true } })
        ]);

        if (!source || !destination) throw new NotFoundException("Account not found");
        if (source.userId !== userId) throw new ForbiddenException("Source account is not owned by actor");
        if (source.status !== "ACTIVE" || destination.status !== "ACTIVE") throw new BadRequestException("Account not active");
        if (source.currency !== destination.currency) throw new BadRequestException("Currency mismatch");
        if (source.id === destination.id) throw new BadRequestException("Same-account transfer is not allowed");
        if (!source.ledgerAccount || !destination.ledgerAccount) throw new ConflictException("Missing ledger mapping");
        if (source.availableBalanceMinor < amountMinor) throw new ConflictException("Insufficient funds");

        const beneficiary = await tx.beneficiary.findFirst({
          where: { ownerUserId: userId, beneficiaryAccountId: destination.id, status: "ACTIVE" }
        });

        const transfer = await tx.transfer.create({
          data: {
            type: dto.type,
            status: "PROCESSING",
            sourceAccountId: source.id,
            destinationAccountId: destination.id,
            sourceUserId: source.userId,
            destinationUserId: destination.userId,
            createdByUserId: userId,
            amountMinor,
            feeMinor: 0n,
            totalDebitMinor: amountMinor,
            currency: source.currency,
            description: dto.description,
            reference: `TRF-${Date.now()}-${Math.floor(Math.random() * 100000)}`
          }
        });

        const riskDecision = await this.risk.evaluateTransfer({
          userId,
          amountMinor,
          isNewBeneficiary: !beneficiary,
          transferId: transfer.id
        });

        if (riskDecision.flagged) {
          const flagged = await tx.transfer.update({
            where: { id: transfer.id },
            data: {
              status: "PENDING_REVIEW",
              riskDecision: riskDecision.flags.join(",")
            }
          });
          return flagged;
        }

        const journal = await tx.journalEntry.create({
          data: {
            type: "TRANSFER",
            transferId: transfer.id,
            reference: `JRN-${transfer.reference}`,
            description: `Transfer ${transfer.reference}`,
            createdByUserId: userId
          }
        });

        await tx.ledgerLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              ledgerAccountId: source.ledgerAccount.id,
              direction: LedgerLineDirection.DEBIT,
              amountMinor
            },
            {
              journalEntryId: journal.id,
              ledgerAccountId: destination.ledgerAccount.id,
              direction: LedgerLineDirection.CREDIT,
              amountMinor
            }
          ]
        });

        const updatedSource = await tx.account.update({
          where: { id: source.id },
          data: {
            availableBalanceMinor: { decrement: amountMinor }
          }
        });

        const updatedDestination = await tx.account.update({
          where: { id: destination.id },
          data: {
            availableBalanceMinor: { increment: amountMinor }
          }
        });

        await tx.transactionView.createMany({
          data: [
            {
              userId: source.userId,
              accountId: source.id,
              transferId: transfer.id,
              direction: "DEBIT",
              counterpartyName: destination.nickname ?? destination.accountNumberMasked,
              amountMinor,
              feeMinor: 0n,
              balanceAfterMinor: updatedSource.availableBalanceMinor,
              currency: source.currency,
              reference: transfer.reference,
              description: dto.description,
              bookedAt: new Date()
            },
            {
              userId: destination.userId,
              accountId: destination.id,
              transferId: transfer.id,
              direction: "CREDIT",
              counterpartyName: source.nickname ?? source.accountNumberMasked,
              amountMinor,
              feeMinor: 0n,
              balanceAfterMinor: updatedDestination.availableBalanceMinor,
              currency: destination.currency,
              reference: transfer.reference,
              description: dto.description,
              bookedAt: new Date()
            }
          ]
        });

        const posted = await tx.transfer.update({
          where: { id: transfer.id },
          data: {
            status: "POSTED",
            postedAt: new Date()
          }
        });

        return posted;
      }, { isolationLevel: "Serializable" });

      const response = { transfer: transferResult };
      if (!idem.replay) await this.finalizeIdempotency(idem.item.id, response);

      if (transferResult.status === "POSTED") {
        await this.notifications.notifyInApp(userId, `Transfer ${transferResult.reference} posted successfully.`, "TRANSFER_POSTED");
      }
      await this.audit.log({
        actorType: AuditActorType.USER,
        actorUserId: userId,
        action: "TRANSFER_CREATE",
        entityType: "Transfer",
        entityId: String(transferResult.id),
        ipAddress: context.ipAddress ?? null,
        requestId: context.requestId ?? null,
        metadataJson: { status: transferResult.status }
      });

      return response;
    } catch (error) {
      if (!idem.replay) await this.failIdempotency(idem.item.id);
      throw error;
    }
  }

  async manualAdjustment(
    actorUserId: string,
    dto: ManualAdjustmentDto,
    idempotencyKey: string,
    context: { ipAddress?: string; requestId?: string }
  ) {
    if (!idempotencyKey) throw new BadRequestException("Idempotency-Key is required");
    const amountMinor = BigInt(dto.amountMinor);
    if (amountMinor === 0n) throw new BadRequestException("Adjustment amount cannot be zero");

    const idem = await this.reserveIdempotency(actorUserId, "manual-adjustment", idempotencyKey);
    if (idem.replay) return idem.payload;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await this.lockAccounts(tx, [dto.accountId]);
        const account = await tx.account.findUnique({
          where: { id: dto.accountId },
          include: { ledgerAccount: true }
        });
        if (!account || !account.ledgerAccount) throw new NotFoundException("Account not found");

        const suspenseLedger = await tx.ledgerAccount.findUnique({ where: { code: "SYS-SUSPENSE-CZK" } });
        if (!suspenseLedger) throw new ConflictException("System suspense ledger missing");

        if (amountMinor < 0n && account.availableBalanceMinor < -amountMinor) {
          throw new ConflictException("Insufficient funds for debit adjustment");
        }

        const transfer = await tx.transfer.create({
          data: {
            type: "MANUAL_ADJUSTMENT",
            status: "PROCESSING",
            sourceAccountId: amountMinor < 0n ? account.id : suspenseLedger.accountId!,
            destinationAccountId: amountMinor < 0n ? suspenseLedger.accountId! : account.id,
            sourceUserId: amountMinor < 0n ? account.userId : null,
            destinationUserId: amountMinor > 0n ? account.userId : null,
            createdByUserId: actorUserId,
            amountMinor: amountMinor < 0n ? -amountMinor : amountMinor,
            feeMinor: 0n,
            totalDebitMinor: amountMinor < 0n ? -amountMinor : amountMinor,
            currency: account.currency,
            reference: `ADJ-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            reason: dto.reason,
            description: dto.reason
          }
        });

        const journal = await tx.journalEntry.create({
          data: {
            type: "ADJUSTMENT",
            transferId: transfer.id,
            reference: `JRN-${transfer.reference}`,
            description: dto.reason,
            createdByUserId: actorUserId
          }
        });

        const debitAccountId = amountMinor > 0n ? suspenseLedger.id : account.ledgerAccount.id;
        const creditAccountId = amountMinor > 0n ? account.ledgerAccount.id : suspenseLedger.id;
        const absAmount = amountMinor > 0n ? amountMinor : -amountMinor;

        await tx.ledgerLine.createMany({
          data: [
            { journalEntryId: journal.id, ledgerAccountId: debitAccountId, direction: "DEBIT", amountMinor: absAmount },
            { journalEntryId: journal.id, ledgerAccountId: creditAccountId, direction: "CREDIT", amountMinor: absAmount }
          ]
        });

        const updated = await tx.account.update({
          where: { id: account.id },
          data: {
            availableBalanceMinor: amountMinor > 0n ? { increment: absAmount } : { decrement: absAmount }
          }
        });

        await tx.transactionView.create({
          data: {
            userId: account.userId,
            accountId: account.id,
            transferId: transfer.id,
            direction: amountMinor > 0n ? "CREDIT" : "DEBIT",
            counterpartyName: "Manual adjustment",
            amountMinor: absAmount,
            feeMinor: 0n,
            balanceAfterMinor: updated.availableBalanceMinor,
            currency: account.currency,
            reference: transfer.reference,
            description: dto.reason,
            bookedAt: new Date()
          }
        });

        return tx.transfer.update({
          where: { id: transfer.id },
          data: { status: "POSTED", postedAt: new Date() }
        });
      }, { isolationLevel: "Serializable" });

      const response = { transfer: result };
      if (!idem.replay) await this.finalizeIdempotency(idem.item.id, response);

      await this.audit.log({
        actorType: AuditActorType.ADMIN,
        actorUserId: actorUserId,
        action: "ACCOUNT_MANUAL_ADJUSTMENT",
        entityType: "Transfer",
        entityId: result.id,
        reason: dto.reason,
        ipAddress: context.ipAddress ?? null,
        requestId: context.requestId ?? null,
        metadataJson: { amountMinor: dto.amountMinor, accountId: dto.accountId }
      });

      return response;
    } catch (error) {
      if (!idem.replay) await this.failIdempotency(idem.item.id);
      throw error;
    }
  }

  async transactionDetail(userId: string, transferId: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        sourceAccount: true,
        destinationAccount: true,
        journalEntries: { include: { lines: true } },
        riskEvents: true
      }
    });
    if (!transfer) throw new NotFoundException("Transfer not found");
    if (transfer.sourceUserId !== userId && transfer.destinationUserId !== userId) {
      throw new ForbiddenException("Forbidden");
    }
    return transfer;
  }

  async listAllForOps() {
    return this.prisma.transfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        sourceAccount: true,
        destinationAccount: true
      }
    });
  }
}
