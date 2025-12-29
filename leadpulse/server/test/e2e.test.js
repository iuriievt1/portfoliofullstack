import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

let app;
let accessToken;
let orgId;
let leadId;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = `mongodb://localhost:27017/leadpulse_test`;
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.JWT_ACCESS_SECRET = "test_access_secret";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret";

  const { connectDb } = await import("../src/db.js");
  const { createApp } = await import("../src/app.js");
  await connectDb();
  app = createApp();

  // clean
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("LeadPulse E2E", () => {
  it("registers and logs in", async () => {
    const email = "test@leadpulse.dev";
    const password = "TestPassword123!";

    await request(app).post("/api/auth/register").send({ email, password, name: "Test" }).expect(200);

    const loginRes = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
    expect(loginRes.body.accessToken).toBeTruthy();
    accessToken = loginRes.body.accessToken;
  });

  it("creates an org", async () => {
    const res = await request(app)
      .post("/api/orgs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Test Org" })
      .expect(200);

    orgId = res.body.org.id;
    expect(orgId).toBeTruthy();
  });

  it("creates and moves a lead", async () => {
    const createRes = await request(app)
      .post(`/api/orgs/${orgId}/leads`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "ACME", email: "team@acme.cz", stage: "new" })
      .expect(200);

    leadId = createRes.body.lead.id;

    const moveRes = await request(app)
      .patch(`/api/orgs/${orgId}/leads/${leadId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ stage: "qualified" })
      .expect(200);

    expect(moveRes.body.lead.stage).toBe("qualified");
  });
});
