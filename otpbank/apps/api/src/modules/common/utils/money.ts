export function assertPositiveMinor(amount: bigint, field = "amountMinor") {
  if (amount <= 0n) throw new Error(`${field} must be positive`);
}

export function formatMinor(minor: bigint | number) {
  const value = typeof minor === "number" ? BigInt(minor) : minor;
  const sign = value < 0n ? "-" : "";
  const abs = value < 0n ? -value : value;
  const whole = abs / 100n;
  const fraction = abs % 100n;
  return `${sign}${whole}.${fraction.toString().padStart(2, "0")}`;
}
