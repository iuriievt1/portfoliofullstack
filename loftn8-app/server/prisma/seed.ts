import { PrismaClient, MenuSection } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertCategory(venueId: number, name: string, sort: number, section: MenuSection) {
  const existing = await prisma.menuCategory.findFirst({ where: { venueId, name } });
  if (existing) {
    return prisma.menuCategory.update({
      where: { id: existing.id },
      data: { sort, section },
    });
  }
  return prisma.menuCategory.create({ data: { venueId, name, sort, section } });
}

// ✅ апсерт позиции по name в рамках venue (можем переносить item между категориями)
async function upsertItemInVenue(
  venueId: number,
  categoryId: number,
  data: { name: string; description?: string; priceCzk: number; sort: number }
) {
  const existing = await prisma.menuItem.findFirst({
    where: { name: data.name, category: { venueId } },
    include: { category: true },
  });

  if (existing) {
    return prisma.menuItem.update({
      where: { id: existing.id },
      data: {
        categoryId,
        description: data.description,
        priceCzk: data.priceCzk,
        sort: data.sort,
        isActive: true,
      },
    });
  }

  return prisma.menuItem.create({ data: { categoryId, ...data, isActive: true } });
}

async function main() {
  // V1: один venue
  const venue = await prisma.venue.upsert({
    where: { slug: "pilot" },
    update: { name: "Loft N8 (Pilot)" },
    create: { name: "Loft N8 (Pilot)", slug: "pilot" },
  });

  // столы
  const tablesCount = 20;
  for (let i = 1; i <= tablesCount; i++) {
    const code = `T${i}`;
    await prisma.table.upsert({
      where: { code },
      update: { venueId: venue.id, label: `Table ${i}` },
      create: { venueId: venue.id, code, label: `Table ${i}` },
    });
  }

  // ✅ Структура категорий
  const DISHES: Array<[string, number]> = [
    ["APPETIZERS / SNACKS", 1],
    ["SALADS / SOUPS", 2],
    ["FISH / MEAT", 3],
    ["BURGERS / SANDWICHES", 4],
    ["SUSHI", 5],
    ["SPECIALITY", 6],
    ["SIDE DISHES / SAUCES", 7],
    ["DESSERTS", 8],
  ];

  const DRINKS: Array<[string, number]> = [
    ["COCKTAILS", 1],
    ["SPIRITS", 2],
    ["BEER", 3],
    ["WINE", 4],
    ["SOFT DRINKS", 5],
    ["HOT DRINKS", 6],
  ];

  const HOOKAH: Array<[string, number]> = [["CLASSIC HOOKAH", 1]];

  // создаём/апдейтим категории
  const cats = new Map<string, { id: number }>();

  for (const [name, sort] of DISHES) {
    const c = await upsertCategory(venue.id, name, sort, MenuSection.DISHES);
    cats.set(name, c);
  }
  for (const [name, sort] of DRINKS) {
    const c = await upsertCategory(venue.id, name, sort, MenuSection.DRINKS);
    cats.set(name, c);
  }
  for (const [name, sort] of HOOKAH) {
    const c = await upsertCategory(venue.id, name, sort, MenuSection.HOOKAH);
    cats.set(name, c);
  }

  // ✅ если были старые "Kitchen/Bar/Hookah" — переносим их items и удаляем категории
  const legacyKitchen = await prisma.menuCategory.findFirst({ where: { venueId: venue.id, name: "Kitchen" } });
  const legacyBar = await prisma.menuCategory.findFirst({ where: { venueId: venue.id, name: "Bar" } });
  const legacyHookah = await prisma.menuCategory.findFirst({ where: { venueId: venue.id, name: "Hookah" } });

  const burgersCat = cats.get("BURGERS / SANDWICHES");
  const softDrinksCat = cats.get("SOFT DRINKS");
  const classicHookahCat = cats.get("CLASSIC HOOKAH");

  if (!burgersCat || !softDrinksCat || !classicHookahCat) {
    throw new Error("Seed error: required categories not created");
  }

  if (legacyKitchen) {
    await prisma.menuItem.updateMany({
      where: { categoryId: legacyKitchen.id },
      data: { categoryId: burgersCat.id },
    });
  }
  if (legacyBar) {
    await prisma.menuItem.updateMany({
      where: { categoryId: legacyBar.id },
      data: { categoryId: softDrinksCat.id },
    });
  }
  if (legacyHookah) {
    await prisma.menuItem.updateMany({
      where: { categoryId: legacyHookah.id },
      data: { categoryId: classicHookahCat.id },
    });
  }

  await prisma.menuCategory.deleteMany({
    where: { venueId: venue.id, name: { in: ["Kitchen", "Bar", "Hookah"] } },
  });

  // ✅ МЕНЮ: заполняем по категориям (дальше просто дописывай сюда массивы)
  const itemsByCategory: Record<
    string,
    Array<{ name: string; description?: string; priceCzk: number; sort: number }>
  > = {
    // === APPETIZERS / SNACKS (по твоим скринам) ===
    "APPETIZERS / SNACKS": [
      { name: "KOREAN CARROT SALAD", description: "grated carrots in Korean spices with garlic / 100g", priceCzk: 85, sort: 1 },
      { name: "WAKAME SEAWEED", description: "Wakame seaweed salad with sesame (1,5,6,8,11) / 100g", priceCzk: 110, sort: 2 },
      { name: "BEEF CARPACCIO", description: "Argentinian aged filet, parmesan, arugula, crispy baguette, olive oil (1,3,7,11) / 110g", priceCzk: 445, sort: 3 },
      { name: "BEEF TARTARE WITH TRUFFLE OIL", description: "Chopped Argentinian aged filet, capers, balsamic, olive oil, marinated cucumber, red onion, crispy garlic toast, quail eggs (1,3,6) / 110g", priceCzk: 435, sort: 4 },
      { name: "SALMON TARTARE", description: "salmon, capers, sweet onion, arugula, whole wheat baguette (1,3,4,6,7,11) / 100g", priceCzk: 285, sort: 5 },
      { name: "FRIED TEMPURA SHRIMPS", description: "served with sweet chilli sauce (1,2,3) / 100g", priceCzk: 220, sort: 6 },
      { name: "FRIED TEMPURA CHICKEN STRIPS", description: "served with sweet chilli sauce (1,3) / 100g", priceCzk: 165, sort: 7 },
      { name: "CHEESE PLATTER", description: "4 types of cheese, honey, fig jam, apples, crackers (1,3,7)", priceCzk: 310, sort: 8 },
      { name: "PANCAKE ROLLS WITH CAVIAR", description: "Pancakes, red caviar, dill, mayo dip (1,3,4,7,10) / 4 pcs", priceCzk: 225, sort: 9 },
      { name: "PANCAKE ROLLS WITH SALMON", description: "Pancakes, salmon, Philadelphia cheese, mayo, chives (1,3,4,7,10) / 4 pcs", priceCzk: 195, sort: 10 },
      { name: "PANCAKES WITH BEEF", description: "Pancakes, beef, sour cream, dill (1,3,7) / 2 pcs", priceCzk: 195, sort: 11 },
      { name: "SPANISH OLIVES", description: "/ 100g", priceCzk: 175, sort: 12 },
      { name: "PISTACHIO", description: "(8) / 60g", priceCzk: 95, sort: 13 },
    ],

    // === SALADS / SOUPS (как на сайте) ===
    "SALADS / SOUPS": [
      {
        name: "WARM SALAD WITH FILET",
        description:
          "110g Argentina aged filet (medium), baked vegetables, champignons, olive oil, balsamico, microgreens (6) / 350g",
        priceCzk: 445,
        sort: 1,
      },
      {
        name: "MIX SALAD",
        description: "kumato tomatoes, cucumber, red onions, dill, cilantro, olive oil / 200g",
        priceCzk: 125,
        sort: 2,
      },
      {
        name: "GREEK SALAD",
        description:
          "Feta cheese, kumato tomatoes, cucumber, red onions, pepper, dill, cilantro, Spanish olives, olive oil (7) / 410g",
        priceCzk: 285,
        sort: 3,
      },
      {
        name: "OLIVIJE WITH BEEF",
        description: "potato salad with beef (3,7,10) / 300g",
        priceCzk: 220,
        sort: 4,
      },
      {
        name: "OLIVIJE WITH CHICKEN",
        description: "potato salad with chicken with chives (3,7,10) / 300g",
        priceCzk: 195,
        sort: 5,
      },
      {
        name: "SALMON ON A FUR COAT",
        description: "multilayer salad with salmon, vegetables and egg (3,4,5,7,10) / 400g",
        priceCzk: 295,
        sort: 6,
      },
      {
        name: "MINI SALMON ON A FUR COAT",
        description: "multilayer salad with salmon, vegetables and egg (3,4,5,7,10) / 200g",
        priceCzk: 175,
        sort: 7,
      },
      {
        name: "CAESAR SALAD",
        description: "little gem, caesar dip, cherry, parmesan, garlic crutons (1,2,3,4,7,10) / 200g",
        priceCzk: 130,
        sort: 8,
      },
      {
        name: "CAESAR SALAD + GRILLED CHICKEN BREAST",
        description: "little gem, caesar dip, cherry, parmesan, garlic crutons (1,2,3,4,7,10) / 320g",
        priceCzk: 295,
        sort: 9,
      },
      {
        name: "CAESAR SALAD + GRILLED SALMON",
        description: "little gem, caesar dip, cherry, parmesan, garlic crutons (1,2,3,4,7,10) / 320g",
        priceCzk: 360,
        sort: 10,
      },
      {
        name: "CAESAR SALAD + GRILLED SHRIMPS",
        description: "little gem, caesar dip, cherry, parmesan, garlic crutons (1,2,3,4,7,10) / 300g",
        priceCzk: 365,
        sort: 11,
      },
      {
        name: "TOM YAM KUNG",
        description: "shrimps, salmon, champignons, cilantro coconut milk, rice (2,4,11) / 0,45l",
        priceCzk: 225,
        sort: 12,
      },
      {
        name: "BORSCH",
        description: "served with garlic bread and sour cream (1,3,7) / 0,4l",
        priceCzk: 175,
        sort: 13,
      },
      {
        name: "CHICKEN SOUP",
        description: "vegetables, chicken, noodles, chives (1,3,5,7) / 0,35l",
        priceCzk: 115,
        sort: 14,
      },
      {
        name: "OKROSHKA seasonal",
        description: "cold soup based on kefir, vegetables and beef, served with garlic bread, and lemon (1,3,7) / 0,45l",
        priceCzk: 145,
        sort: 15,
      },
    ],

    // === остальное пока демо ===
    "BURGERS / SANDWICHES": [{ name: "Burger", description: "Pilot item", priceCzk: 249, sort: 1 }],

    // drinks demo
    "SOFT DRINKS": [{ name: "Coke", description: "Pilot item", priceCzk: 69, sort: 1 }],
    "BEER": [{ name: "Beer", description: "Pilot item", priceCzk: 79, sort: 1 }],

    // hookah demo
    "CLASSIC HOOKAH": [{ name: "Classic hookah", description: "Pilot item", priceCzk: 399, sort: 1 }],
  };

  // какие категории перед заливкой "чистим" (деактивируем все items)
  const RESET_CATEGORIES = new Set<string>([
    "SALADS / SOUPS",
    // при желании можно добавить другие: "APPETIZERS / SNACKS", ...
  ]);

  for (const [catName, items] of Object.entries(itemsByCategory)) {
    const cat = cats.get(catName);
    if (!cat) throw new Error(`Seed error: category not found "${catName}"`);

    if (RESET_CATEGORIES.has(catName)) {
      await prisma.menuItem.updateMany({
        where: { categoryId: cat.id },
        data: { isActive: false },
      });
    }

    for (const item of items) {
      await upsertItemInVenue(venue.id, cat.id, item);
    }
  }

  // ✅ STAFF (как было)
  const waiterUser = process.env.STAFF_PILOT_WAITER_USERNAME || "pilot_waiter";
  const waiterPass = process.env.STAFF_PILOT_WAITER_PASSWORD || "pilot_waiter_1234";

  const hookahUser = process.env.STAFF_PILOT_HOOKAH_USERNAME || "pilot_hookah";
  const hookahPass = process.env.STAFF_PILOT_HOOKAH_PASSWORD || "pilot_hookah_1234";

  const managerUser = process.env.STAFF_PILOT_MANAGER_USERNAME || "pilot_manager";
  const managerPass = process.env.STAFF_PILOT_MANAGER_PASSWORD || "pilot_manager_1234";

  const staffSeed: Array<{ role: "WAITER" | "HOOKAH" | "MANAGER"; username: string; password: string }> = [
    { role: "WAITER", username: waiterUser, password: waiterPass },
    { role: "HOOKAH", username: hookahUser, password: hookahPass },
    { role: "MANAGER", username: managerUser, password: managerPass },
  ];

  for (const s of staffSeed) {
    const passwordHash = await bcrypt.hash(s.password, 10);
    await prisma.staffUser.upsert({
      where: { username: s.username },
      update: { role: s.role as any, venueId: venue.id, passwordHash, isActive: true },
      create: { role: s.role as any, venueId: venue.id, username: s.username, passwordHash, isActive: true },
    });
  }

  console.log("✅ Seed done (menu sections + tables + menu items + staff)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
