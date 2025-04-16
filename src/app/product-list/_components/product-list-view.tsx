'use client';
import { useEffect, useMemo, useTransition } from 'react';

import { useSearchParams } from 'next/navigation';

import { useInfiniteProducts } from '@/api/products/hooks';
import type { InfiniteProductResponse } from '@/api/products/hooks';
import type { Product } from '@/api/products/types';
import ProductListContent from '@/app/product-list/_components/product-list-content';
import ProductListHeader from '@/app/product-list/_components/product-list-header';
import ErrorDisplay from '@/components/ui/error-display';
import useInfiniteScroll from '@/hooks/use-infinite-scroll';
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

function ProductListView({ initialData }: ProductListProps) {
  const { viewMode } = useViewMode();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const queryParams = useMemo(() => {
    const query = searchParams?.get('q') || '';
    const sort = searchParams?.get('sort') === 'rating-desc' ? ('rating-desc' as const) : undefined;
    return { query, sort };
  }, [searchParams]);

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

  const handleLoadMore = () => {
    startTransition(() => {
      fetchNextPage();
    });
  };

  const { targetRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasNextPage: !!hasNextPage,
    isLoading: isFetchingNextPage,
    resetTrigger: queryParams,
  });

  const products = useMemo(() => data?.pages.flatMap((page) => page.products) || [], [data?.pages]);
  const totalCount = useMemo(() => data?.pages[0]?.total || 0, [data?.pages]);

  const handleRefresh = () => {
    startTransition(() => {
      refetch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    if (queryParams.query || queryParams.sort) {
      handleRefresh();
    }
  }, [queryParams.query, queryParams.sort]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isError) {
    return (
      <ErrorDisplay
        message={error instanceof Error ? error.message : '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      <ProductListHeader query={queryParams.query} totalCount={totalCount} isLoading={isLoading} />

      <ProductListContent
        products={products}
        isLoading={isLoading}
        isPending={isPending}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        viewMode={viewMode}
      />

      <div ref={targetRef} className="h-4" aria-hidden="true" data-testid="infinite-scroll-trigger" />
    </div>
  );
}

export default ProductListView;
