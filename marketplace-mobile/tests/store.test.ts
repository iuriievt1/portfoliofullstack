import { mockApi } from "@/api/mock";
import { useCommerceStore } from "@/store";

describe("commerce store", () => {
  beforeEach(() => {
    useCommerceStore.setState({
      cartItems: [],
      favoriteIds: [],
      recentSearches: [],
      selectedPickupPoint: null,
      selectedDeliveryMethod: "pickup_point",
      selectedPaymentMethod: "card",
      draftContact: null
    });
  });

  it("adds products to cart and toggles favorites", () => {
    const product = mockApi.products[0];

    useCommerceStore.getState().addToCart(product);
    useCommerceStore.getState().toggleFavorite(product.id);

    expect(useCommerceStore.getState().cartItems).toHaveLength(1);
    expect(useCommerceStore.getState().favoriteIds).toContain(product.id);
  });

  it("remembers recent searches", () => {
    useCommerceStore.getState().rememberSearch("smart watch");
    useCommerceStore.getState().rememberSearch("gift box");

    expect(useCommerceStore.getState().recentSearches[0]).toBe("gift box");
  });
});
