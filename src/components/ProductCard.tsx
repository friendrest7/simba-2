import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { type Product, formatRWF } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import cartIcon from "@/assets/cart-icon.png";

export function ProductCard({ product }: { product: Product }) {
  const { add, qtyOf, setQty } = useCart();
  const { t } = useI18n();
  const qty = qtyOf(product.id);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col rounded-2xl border bg-card p-2 transition-all hover:shadow-lg hover:border-primary/30">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/30 p-2">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            📦
          </div>
        )}
        
        {/* Getir-style add button */}
        <div className="absolute right-1 top-1 z-10">
          {qty === 0 ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.inStock) add(product);
              }}
              disabled={!product.inStock}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md text-primary hover:bg-primary hover:text-white transition-colors border border-border/50"
              aria-label={t("card.add")}
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex flex-col items-center rounded-lg bg-primary text-primary-foreground shadow-md">
              <button
                onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   setQty(product.id, qty - 1);
                }}
                className="flex h-8 w-8 items-center justify-center hover:bg-white/10"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold py-0.5">{qty}</span>
              <button
                onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   add(product);
                }}
                className="flex h-8 w-8 items-center justify-center hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <span className="rounded-md bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground uppercase tracking-wider">
              {t("card.outOfStock")}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 px-1 pb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-primary">
            {formatRWF(product.price)}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">/ {product.unit}</span>
        </div>
        <Link
          to="/product/$id"
          params={{ id: String(product.id) }}
          className="mt-0.5 block text-[13px] font-semibold leading-snug text-foreground line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]"
        >
          {product.name}
        </Link>
      </div>
    </div>
  );
}
