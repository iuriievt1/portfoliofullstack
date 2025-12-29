import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";
import { config } from "../src/config.js";
import { sha256 } from "../src/lib/hash.js";
import { computeEventHash } from "../src/lib/ledger.js";

async function ensureDemo() {
  const email = "demo@chronoledger.dev";
  const password = "DemoPassword123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? existing
    : await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, 12),
          name: "Demo User"
        }
      });

  const slug = "demo-ledger";
  const org = await prisma.org.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: "ChronoLedger Demo Org"
    }
  });

  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: { role: "OWNER" },
    create: { orgId: org.id, userId: user.id, role: "OWNER" }
  });

  const branch = await prisma.branch.upsert({
    where: { orgId_name: { orgId: org.id, name: "main" } },
    update: {},
    create: { orgId: org.id, name: "main", baseHash: "GENESIS", headHash: "GENESIS" }
  });

  await prisma.apiKey.upsert({
    where: { keyHash: sha256(config.PUBLIC_INGEST_API_KEY) },
    update: { revokedAt: null, orgId: org.id, name: "default" },
    create: { orgId: org.id, name: "default", keyHash: sha256(config.PUBLIC_INGEST_API_KEY) }
  });

  // If already has events, skip seeding
  const count = await prisma.ledgerEvent.count({ where: { orgId: org.id, branchId: branch.id } });
  if (count > 0) {
    return { email, password, orgSlug: slug, publicKey: config.PUBLIC_INGEST_API_KEY, branchId: branch.id, orgId: org.id };
  }

  async function append(type: string, payload: any) {
    const current = await prisma.branch.findUnique({ where: { id: branch.id } });
    const createdAt = new Date();
    const prevHash = current?.headHash ?? "GENESIS";
    const hash = computeEventHash(prevHash, {
      type,
      payload,
      actorId: user.id,
      createdAtISO: createdAt.toISOString()
    });

    const ev = await prisma.ledgerEvent.create({
      data: {
        orgId: org.id,
        branchId: branch.id,
        actorId: user.id,
        type,
        payload,
        createdAt,
        prevHash,
        hash
      }
    });

    await prisma.branch.update({ where: { id: branch.id }, data: { headHash: hash } });
    return ev;
  }

  // demo board
  const c1 = "card_" + Math.random().toString(16).slice(2);
  const c2 = "card_" + Math.random().toString(16).slice(2);
  const c3 = "card_" + Math.random().toString(16).slice(2);

  await append("CARD_CREATED", { id: c1, title: "Implement hash‑chain ledger", status: "doing", tags: ["crypto", "eventsourcing"] });
  await append("CARD_CREATED", { id: c2, title: "Add time‑travel slider in UI", status: "backlog", tags: ["react", "ux"] });
  await append("CARD_CREATED", { id: c3, title: "Fork branch for what‑if scenario", status: "review", tags: ["branching"] });
  await append("CARD_MOVED", { id: c2, status: "doing" });
  await append("CARD_UPDATED", { id: c3, title: "Fork branch from any event (what‑if)" });
  await append("CARD_MOVED", { id: c1, status: "review" });
  await append("CARD_MOVED", { id: c1, status: "done" });

  return { email, password, orgSlug: slug, publicKey: config.PUBLIC_INGEST_API_KEY, branchId: branch.id, orgId: org.id };
}

async function main() {
  const demo = await ensureDemo();

  // eslint-disable-next-line no-console
  console.log("\n✅ Seed completed");
  console.log("Login:", demo.email);
  console.log("Password:", demo.password);
  console.log("Org slug:", demo.orgSlug);
  console.log("Public ingest API key (X-Api-Key):", demo.publicKey);
  console.log("\nExample ingest curl:");
  console.log(
    `curl -X POST http://localhost:${config.PORT}/api/public/append \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: ${demo.publicKey}" \\\n  -d '{"orgSlug":"${demo.orgSlug}","type":"CARD_CREATED","payload":{"id":"card_ext_1","title":"External event created this card","status":"backlog","tags":["ingest"]}}'`
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
