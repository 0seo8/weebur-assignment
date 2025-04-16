'use client';
import { useEffect, useRef, useCallback } from 'react';

import { useSearchParams } from 'next/navigation';

import { useInfiniteProducts } from '@/api/products/hooks';
import type { InfiniteProductResponse } from '@/api/products/hooks';
import type { Product } from '@/api/products/types';
import { ProductGrid } from '@/app/product-list/_components/product-grid';
import { ProductSkeleton } from '@/components/ui/skeleton';
import useViewMode from '@/hooks/use-view-mode';

interface ProductListProps {
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

export default function ProductList({ initialData }: ProductListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { viewMode } = useViewMode();

  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch, isFetching } =
    useInfiniteProducts({
      searchQuery: query,
      sort: sort === 'rating-desc' ? 'rating-desc' : undefined,
      initialData: initialData as InfiniteProductResponse,
    });

  useEffect(() => {
    if (query || sort) {
      refetch();
    }
  }, [query, sort, refetch]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        rootMargin: '0px 0px 300px 0px',
      });
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const products = data?.pages.flatMap((page) => page.products) || [];
  const hasProducts = products.length > 0;

  if (isError) {
    return (
      <div className="bg-white shadow-sm p-10 rounded-xl border border-gray-100 text-center">
        <div className="text-red-500 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto mb-2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h2 className="text-lg font-medium">Connection Error</h2>
        </div>
        <p className="text-gray-600 mb-5">
          {error instanceof Error ? error.message : 'Failed to connect to the server. Please check your network.'}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={
          viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'
        }
        aria-label="Loading products"
        aria-busy="true"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <ProductSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (!hasProducts) {
    return (
      <div className="bg-white shadow-sm p-10 rounded-xl border border-gray-100 text-center">
        <div className="text-gray-400 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto mb-2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <h2 className="text-lg font-medium">No Results Found</h2>
        </div>
        <p className="text-gray-600">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div>
      <ProductGrid products={products} viewMode={viewMode} />
      {isFetchingNextPage && (
        <div className="flex justify-center mt-8 py-6" aria-live="polite" aria-busy="true">
          <div className="flex items-center space-x-2 text-gray-500">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading more products...</span>
          </div>
        </div>
      )}
      {!hasNextPage && hasProducts && (
        <div className="text-center py-8 text-gray-500" aria-live="polite">
          <p className="text-sm font-medium">No more products to load.</p>
        </div>
      )}
      <div ref={loadMoreRef} className="h-4" aria-hidden="true"></div>
    </div>
  );
}
