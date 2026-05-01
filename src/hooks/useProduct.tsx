import { useState, useEffect } from 'react';
import { PRODUCTS, Product, productById } from '@/lib/products';

interface UseProductResult {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate async data fetching
      const productId = parseInt(id, 10);
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      // Use the productById function from lib/products.ts
      const foundProduct = productById(productId);

      if (!foundProduct) {
        throw new Error('Product not found');
      }

      setProduct(foundProduct);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product');
      setProduct(null);
      setIsLoading(false);
    }
  }, [id]);

  return { product, isLoading, error };
}
