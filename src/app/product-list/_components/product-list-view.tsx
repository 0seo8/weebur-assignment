'use client';
import { useEffect, useRef, useCallback, useMemo, useTransition, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useInfiniteProducts } from '@/api/products/hooks';
import type { InfiniteProductResponse } from '@/api/products/hooks';
import type { Product } from '@/api/products/types';
import ProductGrid from '@/app/product-list/_components/product-grid';
import ViewModeToggle from '@/app/product-list/_components/view-mode-toggle';
import ErrorDisplay from '@/components/ui/error-display';
import LoadingIndicator from '@/components/ui/loading-indicator';
import NoResultsDisplay from '@/components/ui/no-results-display';
import { ProductSkeletonWrapper } from '@/components/ui/skeleton';
import useViewMode from '@/hooks/use-view-mode';

export interface ProductListProps {
  initialData?: {
    pages: Array<{
      products: Product[];
      total: number;
      limit: number;
      skip: number;
    }>;
    pageParams: number[];
  };
}

const createIntersectionObserver = (callback: IntersectionObserverCallback) =>
  new IntersectionObserver(callback, {
    rootMargin: '0px 0px 300px 0px',
  });

function ProductListView({ initialData }: ProductListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { viewMode } = useViewMode();
  const searchParams = useSearchParams();

  const queryParams = useMemo(() => {
    const query = searchParams?.get('q') || '';
    const sort = searchParams?.get('sort') === 'rating-desc' ? ('rating-desc' as const) : undefined;
    return { query, sort };
  }, [searchParams]);

  const [isPending, startTransition] = useTransition();
  const [shouldInitObserver, setShouldInitObserver] = useState(true);

  const queryOptions = useMemo(
    () => ({
      searchQuery: queryParams.query,
      sort: queryParams.sort,
      initialData: initialData as InfiniteProductResponse,
    }),
    [queryParams.query, queryParams.sort, initialData],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } =
    useInfiniteProducts(queryOptions);

  useEffect(() => {
    if (queryParams.query || queryParams.sort) {
      startTransition(() => {
        refetch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShouldInitObserver(true);
      });
    }
  }, [queryParams.query, queryParams.sort, refetch]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        startTransition(() => {
          fetchNextPage();
        });
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, startTransition],
  );

  useEffect(() => {
    if (loadMoreRef.current && shouldInitObserver) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = createIntersectionObserver(handleObserver);
      observerRef.current.observe(loadMoreRef.current);

      setShouldInitObserver(false);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, shouldInitObserver]);

  const products = useMemo(() => data?.pages.flatMap((page) => page.products) || [], [data?.pages]);

  const derivedData = useMemo(() => {
    const hasProducts = products.length > 0;
    const totalCount = data?.pages[0]?.total || 0;
    return { hasProducts, totalCount };
  }, [products, data?.pages]);

  if (isError) {
    return (
      <ErrorDisplay
        message={error instanceof Error ? error.message : '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return <ProductSkeletonWrapper itemCount={20} />;
  }

  if (!derivedData.hasProducts) {
    return <NoResultsDisplay />;
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600" id="products-info">
            {queryParams.query ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{derivedData.totalCount}</span>
                <span>개의 검색 결과</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                  {queryParams.query}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>총</span>
                <span className="font-medium text-gray-800">{derivedData.totalCount}</span>
                <span>개의 상품</span>
              </div>
            )}
          </div>
          <ViewModeToggle />
        </div>
      </div>

      <ProductGrid products={products} viewMode={viewMode} />

      {(isFetchingNextPage || isPending) && <LoadingIndicator text="상품을 더 불러오는 중..." />}

      {!hasNextPage && derivedData.hasProducts && (
        <div className="text-center py-8 text-gray-500" aria-live="polite">
          <p className="text-sm font-medium">더 이상 불러올 수 없습니다.</p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" aria-hidden="true"></div>
    </div>
  );
}

export default ProductListView;
