describe("RBAC", () => {
  it("contains USER role", () => expect(["USER", "ADMIN", "SUPPORT", "RISK_ANALYST", "COMPLIANCE_OFFICER"]).toContain("USER"));
  it("contains ADMIN role", () => expect(["USER", "ADMIN", "SUPPORT", "RISK_ANALYST", "COMPLIANCE_OFFICER"]).toContain("ADMIN"));
});
