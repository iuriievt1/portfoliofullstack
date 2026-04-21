import { addressSchema, authSchema, checkoutContactSchema, supportSchema } from "@/utils";

describe("validation schemas", () => {
  it("accepts valid auth input", () => {
    expect(
      authSchema.safeParse({
        firstName: "Klara",
        lastName: "Novak",
        email: "buyer@example.com",
        phone: "+420777123123"
      }).success
    ).toBe(true);
  });

  it("rejects invalid address", () => {
    expect(
      addressSchema.safeParse({
        label: "A",
        fullName: "B",
        phone: "123",
        street: "St",
        city: "P",
        postalCode: "1"
      }).success
    ).toBe(false);
  });

  it("requires checkout contact info", () => {
    expect(
      checkoutContactSchema.safeParse({
        fullName: "Klára Nováková",
        email: "klara@example.com",
        phone: "+420777123123"
      }).success
    ).toBe(true);
  });

  it("requires longer support message", () => {
    expect(
      supportSchema.safeParse({
        topic: "Return",
        message: "Short"
      }).success
    ).toBe(false);
  });
});
