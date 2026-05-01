import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Minus, Package2, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatRWF, productById, productDescription } from "@/lib/products";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const productId = Number(params.id);
    const product = Number.isInteger(productId) ? productById(productId) : undefined;
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetailPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.product.name ?? "Product"} - Simba Supermarket` }],
  }),
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { add, stockOf } = useCart();
  const { t } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const branchStock = stockOf(product.id);

  const handleAddToCart = async () => {
    if (branchStock <= 0 || quantity <= 0) return;
    await add(product, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        {t("ui.backToProducts")}
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex justify-center lg:justify-start">
          <div className="flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg border bg-secondary/30 p-8 shadow-lg">
            {!imageError ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImageError(true)}
                className="h-auto max-h-[420px] w-full object-contain"
              />
            ) : (
              <Package2 className="h-16 w-16 text-primary" />
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="text-sm font-semibold text-muted-foreground">{product.category}</div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="mb-4 text-xl font-semibold text-primary">{formatRWF(product.price)}</p>
            <p className="mb-2 text-sm text-muted-foreground">{productDescription(product, t)}</p>
            <p className="text-sm font-medium text-primary">
              {branchStock > 0
                ? `${branchStock} ${t("pickup.availableNow")}`
                : t("pickup.outOfStockBranch")}
            </p>
          </div>

          <div className="mt-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-md"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                min="1"
                className="h-8 w-16 border-0 p-0 text-center focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 rounded-md"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => void handleAddToCart()}
              className="flex flex-1 items-center gap-2"
              disabled={branchStock <= 0}
            >
              <ShoppingBag className="h-4 w-4" />
              {t("card.add")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
