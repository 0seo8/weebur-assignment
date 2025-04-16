import React from 'react';

import type { Product } from '@/api/products/types';
import ProductCard from '@/app/product-list/_components/product-card';

export function ProductGrid({ products, viewMode }: { products: Product[]; viewMode: 'list' | 'grid' }) {
  return (
    <div
      className={
        viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'
      }
    >
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}
