import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [adminRole, userRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" }
    }),
    prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: { name: "user" }
    })
  ]);

  const passwordHash = await bcrypt.hash("DenisaSmidova!@567321!", 12);

  const denisa = await prisma.user.upsert({
    where: { email: "denisa@portal.local" },
    update: {
      publicId: "Denisa Šmídová001",
      name: "Denisa Šmídová",
      email: "denisa@portal.local",
      passwordHash,
      roleId: adminRole.id,
      emailVerifiedAt: new Date(),
      consentAcceptedAt: new Date()
    },
    create: {
      publicId: "Denisa Šmídová001",
      name: "Denisa Šmídová",
      email: "denisa@portal.local",
      passwordHash,
      roleId: adminRole.id,
      emailVerifiedAt: new Date(),
      consentAcceptedAt: new Date()
    }
  });

  await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {
      publicId: "284761953",
      name: "Ukázkový klient",
      passwordHash: await bcrypt.hash("Client123!", 12),
      roleId: userRole.id,
      emailVerifiedAt: new Date(),
      consentAcceptedAt: new Date()
    },
    create: {
      publicId: "284761953",
      name: "Ukázkový klient",
      email: "client@example.com",
      passwordHash: await bcrypt.hash("Client123!", 12),
      roleId: userRole.id,
      emailVerifiedAt: new Date(),
      consentAcceptedAt: new Date()
    }
  });

  const rootFolder = await prisma.folder.upsert({
    where: { id: "seed-root-folder" },
    update: {
      name: "Klienti",
      category: "Klienti",
      authorId: denisa.id
    },
    create: {
      id: "seed-root-folder",
      name: "Klienti",
      category: "Klienti",
      authorId: denisa.id
    }
  });

  await prisma.folder.upsert({
    where: { id: "seed-child-folder" },
    update: {
      name: "Procesní podání",
      category: "Podání",
      parentId: rootFolder.id,
      authorId: denisa.id
    },
    create: {
      id: "seed-child-folder",
      name: "Procesní podání",
      category: "Podání",
      parentId: rootFolder.id,
      authorId: denisa.id
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
