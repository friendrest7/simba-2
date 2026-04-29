import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/Storefront";
import { getStoredLang, translate } from "@/lib/i18n";
import { validateShopSearch } from "@/lib/shop-search";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
  validateSearch: validateShopSearch,
  head: () => ({
    meta: [
      { title: `${translate(getStoredLang(), "nav.shop")} - Simba Supermarket` },
      { name: "description", content: translate(getStoredLang(), "products.storefrontBody") },
    ],
  }),
});

function ShopPage() {
  return <Storefront search={Route.useSearch()} basePath="/shop" titleKey="nav.shop" />;
}
