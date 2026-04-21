import { calculateCartTotal, formatCurrency, getDiscountPercent } from "@/utils";
import { mockApi } from "@/api/mock";

describe("utils", () => {
  it("formats CZK currency", () => {
    expect(formatCurrency(1299)).toContain("1");
    expect(formatCurrency(1299)).toContain("Kč");
  });

  it("calculates discount percent", () => {
    expect(getDiscountPercent(mockApi.products[0])).toBeGreaterThan(0);
  });

  it("calculates cart total from products", () => {
    expect(
      calculateCartTotal(
        [
          { id: "1", productId: "p1", quantity: 2, sellerId: "s1" },
          { id: "2", productId: "p4", quantity: 1, sellerId: "s3" }
        ],
        mockApi.products
      )
    ).toBe(3988);
  });
});
