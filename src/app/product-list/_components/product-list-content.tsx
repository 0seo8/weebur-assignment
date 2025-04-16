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

      {isFetchingNextPage && (
        <div className="text-center py-4">
          <LoadingIndicator text="상품을 더 불러오는 중..." />
        </div>
      )}

      {isPending && !isFetchingNextPage && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 z-50">
          <span className="text-sm flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            처리 중...
          </span>
        </div>
      )}

      {!hasNextPage && hasProducts && (
        <div className="text-center py-8 text-gray-500" aria-live="polite">
          <p className="text-sm font-medium">더 이상 불러올 상품이 없습니다.</p>
        </div>
      )}

      {products.length === 0 && !isLoading && !isPending && <NoResultsDisplay />}
    </>
  );
}

export default memo(ProductListContent);
