import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDb } from "../db.js";
import { config } from "../config.js";
import { User } from "../models/user.model.js";
import { Org } from "../models/org.model.js";
import { Membership } from "../models/membership.model.js";
import { Lead } from "../models/lead.model.js";

async function seed() {
  await connectDb();

  const email = "demo@leadpulse.dev";
  const password = "DemoPassword123!";

  // Upsert demo user
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await User.create({ email, passwordHash, name: "Demo User" });
  }

  // Create a fresh org each seed run
  const org = await Org.create({ name: `Demo Org ${new Date().toISOString().slice(0,10)}`, publicKey: `lp_${nanoid(16)}` });
  await Membership.create({ org: org._id, user: user._id, role: "owner" });

  const sample = [
    { name: "ACME s.r.o.", email: "team@acme.cz", stage: "new", company: "ACME", message: "We need a new website", value: 25000, tags: ["web","cz"] },
    { name: "Nordic Studio", email: "hello@nordic.studio", stage: "contacted", company: "Nordic Studio", message: "Interested in performance audit", value: 15000, tags: ["audit"] },
    { name: "Euterpe Event", email: "booking@euterpe.cz", stage: "proposal", company: "EUTERPE", message: "Need ticketing + CRM", value: 80000, tags: ["events","crm"] },
    { name: "CryptoON", email: "ops@cyberon.net", stage: "qualified", company: "CyberON", message: "Need admin dashboard", value: 45000, tags: ["dashboard","saas"] }
  ];

  await Lead.insertMany(sample.map((x) => ({
    org: org._id,
    source: "manual",
    lastTouchedAt: new Date(),
    ...x
  })));

  // eslint-disable-next-line no-console
  console.log("\n✅ Seed complete");
  console.log(`Mongo: ${config.mongodbUri}`);
  console.log(`Login email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Org: ${org.name}`);
  console.log(`OrgId: ${org._id.toString()}`);
  console.log(`PublicKey (for /api/public/lead): ${org.publicKey}\n`);

  await mongoose.connection.close();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
