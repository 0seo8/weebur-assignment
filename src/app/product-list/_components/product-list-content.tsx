'use client';

import { memo } from 'react';

import type { Product } from '@/api/products/types';
import ProductGrid from '@/app/product-list/_components/product-grid';
import LoadingIndicator from '@/components/ui/loading-indicator';
import NoResultsDisplay from '@/components/ui/no-results-display';
import { ProductSkeletonWrapper } from '@/components/ui/skeleton';

interface ProductListContentProps {
  products: Product[];
  isLoading: boolean;
  isPending: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  viewMode: 'grid' | 'list';
}

function ProductListContent({
  products,
  isLoading,
  isPending,
  isFetchingNextPage,
  hasNextPage,
  viewMode,
}: ProductListContentProps) {
  const hasProducts = products.length > 0;

  if (isLoading) {
    return <ProductSkeletonWrapper itemCount={20} />;
  }

  if (!hasProducts) {
    return <NoResultsDisplay />;
  }

  return (
    <>
      <ProductGrid products={products} viewMode={viewMode} />

      {(isFetchingNextPage || isPending) && <LoadingIndicator text="상품을 더 불러오는 중..." />}

      {!hasNextPage && (
        <div className="text-center py-8 text-gray-500" aria-live="polite">
          <p className="text-sm font-medium">더 이상 불러올 수 없습니다.</p>
        </div>
      )}
    </>
  );
}

export default memo(ProductListContent);
