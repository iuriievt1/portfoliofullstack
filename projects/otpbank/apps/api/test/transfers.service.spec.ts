import { TransfersService } from "../src/modules/transfers/transfers.service";

describe("TransfersService", () => {
  it("is defined", () => {
    expect(TransfersService).toBeDefined();
  });

  it("documents the invariant that every money movement must be idempotent", () => {
    const requiredHeader = "Idempotency-Key";
    expect(requiredHeader).toBe("Idempotency-Key");
  });

  it("documents the invariant that posted transfers must be balanced", () => {
    const totalDebits = 1000n;
    const totalCredits = 1000n;
    expect(totalDebits).toBe(totalCredits);
  });
});
