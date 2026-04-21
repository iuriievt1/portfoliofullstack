import { render } from "@testing-library/react-native";

import { I18nProvider } from "@/i18n";
import { ProductCard } from "@/shared/ui";
import { mockApi } from "@/api/mock";

describe("ProductCard", () => {
  it("renders product basics", () => {
    const product = mockApi.products[0];
    const { getByText, getByLabelText } = render(
      <I18nProvider>
        <ProductCard product={product} onPress={() => undefined} onAddToCart={() => undefined} />
      </I18nProvider>
    );

    expect(getByText(product.name)).toBeTruthy();
    expect(getByText(product.brand)).toBeTruthy();
    expect(getByLabelText(/add to cart|do košíku/i)).toBeTruthy();
  });
});
