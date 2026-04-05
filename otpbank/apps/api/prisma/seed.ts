import { PrismaClient, Role, UserStatus, AccountStatus, AccountType, Currency, LedgerAccountType } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

function ibanFor(n: number) {
  return `CZ6508000000000000${String(n).padStart(4, "0")}`;
}

async function ensureUser(email: string, roles: Role[], firstName: string, lastName: string) {
  const password = process.env.DEMO_PASSWORD ?? "OtpbankDemo123!";
  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: UserStatus.ACTIVE, mfaEnabled: true },
    create: {
      email,
      passwordHash,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      mfaEnabled: true,
      roles: { createMany: { data: roles.map((role) => ({ role })) } },
      profile: { create: { firstName, lastName, countryCode: "CZ", city: "Prague" } },
      kycRecords: { create: { provider: "mock", status: "VERIFIED" } }
    }
  });

  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role } },
      update: {},
      create: { userId: user.id, role }
    });
  }

  return user;
}

async function ensureSystemAccount(ibanSuffix: number, code: string, name: string, type: AccountType, ledgerType: LedgerAccountType, currency: Currency) {
  const iban = ibanFor(ibanSuffix);
  const account = await prisma.account.upsert({
    where: { iban },
    update: {},
    create: {
      type,
      status: AccountStatus.ACTIVE,
      currency,
      iban,
      accountNumberMasked: `****${String(ibanSuffix).padStart(4, "0")}`,
      nickname: name
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { code },
    update: {},
    create: {
      accountId: account.id,
      code,
      name,
      type: ledgerType,
      currency,
      allowManualPosting: true
    }
  });
}

async function ensureCustomerAccount(userId: string, idx: number, nickname: string, balanceMinor: bigint) {
  const iban = ibanFor(idx);
  const account = await prisma.account.upsert({
    where: { iban },
    update: { status: AccountStatus.ACTIVE, availableBalanceMinor: balanceMinor },
    create: {
      userId,
      type: AccountType.CURRENT,
      status: AccountStatus.ACTIVE,
      currency: Currency.CZK,
      iban,
      accountNumberMasked: `****${String(idx).padStart(4, "0")}`,
      nickname,
      availableBalanceMinor: balanceMinor,
      isPrimary: idx % 2 === 1
    }
  });

  await prisma.ledgerAccount.upsert({
    where: { accountId: account.id },
    update: {},
    create: {
      accountId: account.id,
      code: `CUS-${idx}`,
      name: `${nickname} liability`,
      type: LedgerAccountType.LIABILITY,
      currency: Currency.CZK
    }
  });

  return account;
}

async function main() {
  const admin = await ensureUser(process.env.DEMO_ADMIN_EMAIL ?? "admin@otpbank.local", [Role.ADMIN, Role.RISK_ANALYST, Role.COMPLIANCE_OFFICER], "Admin", "OTPBank");
  const support = await ensureUser(process.env.DEMO_SUPPORT_EMAIL ?? "support@otpbank.local", [Role.SUPPORT], "Support", "OTPBank");
  const user = await ensureUser(process.env.DEMO_USER_EMAIL ?? "user@otpbank.local", [Role.USER], "Demo", "Customer");

  await ensureSystemAccount(9001, "SYS-SUSPENSE-CZK", "System suspense CZK", AccountType.INTERNAL_SUSPENSE, LedgerAccountType.ASSET, Currency.CZK);
  await ensureSystemAccount(9002, "SYS-FEE-REV-CZK", "Fee revenue CZK", AccountType.INTERNAL_FEE_REVENUE, LedgerAccountType.REVENUE, Currency.CZK);

  const mainAccount = await ensureCustomerAccount(user.id, 1001, "Everyday CZK", 2500000n);
  const secondAccount = await ensureCustomerAccount(user.id, 1002, "Savings CZK", 15000000n);
  const supportAccount = await ensureCustomerAccount(support.id, 1003, "Support Demo", 1000000n);

  await prisma.card.createMany({
    data: [
      { accountId: mainAccount.id, maskedPan: "5412 **** **** 2401", holderName: "Demo Customer", brand: "Mastercard", isVirtual: true },
      { accountId: secondAccount.id, maskedPan: "5412 **** **** 2402", holderName: "Demo Customer", brand: "Mastercard", isVirtual: true }
    ],
    skipDuplicates: true
  });

  await prisma.beneficiary.upsert({
    where: { ownerUserId_beneficiaryAccountId: { ownerUserId: user.id, beneficiaryAccountId: supportAccount.id } },
    update: {},
    create: { ownerUserId: user.id, beneficiaryAccountId: supportAccount.id, alias: "Known beneficiary" }
  });

  await prisma.document.createMany({
    data: [
      { userId: user.id, type: "STATEMENT", storageKey: "local/statements/jan.pdf", title: "January Statement" },
      { userId: user.id, type: "TERMS", storageKey: "local/docs/terms-v1.pdf", title: "Terms v1.0" }
    ],
    skipDuplicates: true
  });

  await prisma.notification.createMany({
    data: [
      { userId: user.id, channel: "IN_APP", template: "WELCOME", body: "Welcome to OTPBank.", status: "SENT" },
      { userId: user.id, channel: "IN_APP", template: "SECURITY", body: "2FA is enabled on your account.", status: "SENT" }
    ],
    skipDuplicates: true
  });

  await prisma.supportNote.create({
    data: { targetUserId: user.id, authorUserId: admin.id, note: "Seeded demo note for support/backoffice verification." }
  }).catch(() => undefined);

  console.log("Seed complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
