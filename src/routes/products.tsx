import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/Storefront";
import { getStoredLang, translate } from "@/lib/i18n";
import { validateShopSearch } from "@/lib/shop-search";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: validateShopSearch,
  head: () => ({
    meta: [
      { title: `${translate(getStoredLang(), "section.allProducts")} - Simba Supermarket` },
      {
        name: "description",
        content: translate(getStoredLang(), "products.storefrontBody"),
      },
    ],
  }),
});

function ProductsPage() {
  return (
    <Storefront search={Route.useSearch()} basePath="/products" titleKey="section.allProducts" />
  );
}
