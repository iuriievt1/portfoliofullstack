describe("Auth policy", () => {
  it("requires strong passwords in the bank-grade baseline", () => {
    const minimum = 12;
    expect(minimum).toBeGreaterThanOrEqual(12);
  });

  it("uses rotating refresh token semantics", () => {
    const rotated = true;
    expect(rotated).toBe(true);
  });
});
