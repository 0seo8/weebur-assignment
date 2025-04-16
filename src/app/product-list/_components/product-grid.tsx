'use client';

import { memo } from 'react';

import type { Product } from '@/api/products/types';
import ProductCard from '@/app/product-list/_components/product-card';

interface ProductGridProps {
  products: Product[];
  viewMode: 'list' | 'grid';
}

function ProductGrid({ products, viewMode }: ProductGridProps) {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'
          : 'space-y-4'
      }
      role="feed"
      aria-busy={false}
      aria-label={`${products.length}개의 상품이 ${viewMode === 'grid' ? '그리드' : '리스트'} 형태로 표시됨`}
    >
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
