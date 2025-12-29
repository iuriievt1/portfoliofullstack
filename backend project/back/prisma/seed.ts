import { PrismaClient, PromoDiscountType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tariffs = [
    { id: "economy", name: "Economy", description: "Best price for everyday rides", baseFareCents: 4900, perKmCents: 1800, perMinCents: 350, minFareCents: 8900 },
    { id: "comfort", name: "Comfort", description: "Newer cars, more comfort", baseFareCents: 6900, perKmCents: 2200, perMinCents: 450, minFareCents: 11900 },
    { id: "business", name: "Business", description: "Premium cars, premium service", baseFareCents: 9900, perKmCents: 3200, perMinCents: 650, minFareCents: 17900 },
    { id: "xl", name: "XL", description: "More seats, bigger cars", baseFareCents: 8900, perKmCents: 3000, perMinCents: 600, minFareCents: 15900 },
    { id: "electric", name: "Electric", description: "Eco-friendly rides", baseFareCents: 6900, perKmCents: 2400, perMinCents: 450, minFareCents: 12900 },
    { id: "delivery", name: "Delivery", description: "Courier / small parcel delivery", baseFareCents: 5900, perKmCents: 2000, perMinCents: 300, minFareCents: 9900 }
  ];

  for (const t of tariffs) {
    await prisma.tariff.upsert({
      where: { id: t.id },
      create: t,
      update: { ...t }
    });
  }
  console.log("✅ Seeded tariffs:", tariffs.map(t => t.id).join(", "));

  const passPlans = [
    {
      id: "pass_8h",
      name: "8h No-Commission Shift",
      description: "Work 8 hours with 0% commission",
      durationMin: 8 * 60,
      priceCents: 19900,
      currency: "CZK",
      commissionBps: 0,
      isActive: true
    },
    {
      id: "pass_24h",
      name: "24h No-Commission Day",
      description: "Work 24 hours with 0% commission",
      durationMin: 24 * 60,
      priceCents: 39900,
      currency: "CZK",
      commissionBps: 0,
      isActive: true
    },
    {
      id: "pass_7d",
      name: "7 Days No-Commission Week",
      description: "Work 7 days with 0% commission",
      durationMin: 7 * 24 * 60,
      priceCents: 149900,
      currency: "CZK",
      commissionBps: 0,
      isActive: true
    }
  ];

  for (const p of passPlans) {
    await prisma.passPlan.upsert({
      where: { id: p.id },
      create: p,
      update: { ...p }
    });
  }
  console.log("✅ Seeded pass plans:", passPlans.map(p => p.id).join(", "));

  const promos = [
    {
      code: "VEZI50",
      description: "50% off (test)",
      discountType: PromoDiscountType.PERCENT,
      amount: 50,
      maxDiscountCents: 25000,
      minFareCents: 9900,
      isActive: true,
      usageLimitTotal: 10000,
      usageLimitPerUser: 5
    },
    {
      code: "WELCOME100",
      description: "100 Kč off (test)",
      discountType: PromoDiscountType.FIXED,
      amount: 10000,
      maxDiscountCents: 10000,
      minFareCents: 9900,
      isActive: true,
      usageLimitTotal: 10000,
      usageLimitPerUser: 1
    }
  ];

  for (const p of promos) {
    await prisma.promoCode.upsert({
      where: { code: p.code },
      create: p,
      update: { ...p }
    });
  }
  console.log("✅ Seeded promos:", promos.map(p => p.code).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
