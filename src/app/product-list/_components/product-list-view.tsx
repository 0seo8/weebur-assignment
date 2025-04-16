'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import type { InfiniteProductResponse } from '@/api/products/hooks';
import { useInfiniteProducts } from '@/api/products/hooks';
import type { Product } from '@/api/products/types';
import ProductCard from '@/app/product-list/_components/product-card';

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

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
  const isOnline = useNetworkStatus();

  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';

  // 디버그용 로그 추가
  useEffect(() => {
    console.log('검색어 또는 정렬 변경:', { query, sort });
  }, [query, sort]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch, isFetching } =
    useInfiniteProducts({
      searchQuery: query,
      sort: sort === 'rating-desc' ? 'rating-desc' : undefined,
      initialData: initialData as InfiniteProductResponse,
    });

  // 디버그용 로그 추가
  useEffect(() => {
    if (data) {
      console.log('데이터 변경됨:', {
        total: data.pages[0]?.total,
        firstPage: data.pages[0]?.products.length,
        allPages: data.pages.map((p) => p.products.length),
      });
    }
  }, [data]);

  useEffect(() => {
    if (query || sort) {
      refetch();
    }
  }, [query, sort, refetch]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && isOnline) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isOnline],
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

  if (products.length === 0) {
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
          <h2 className="text-lg font-medium">검색 결과가 없습니다</h2>
        </div>
        <p className="text-gray-600">다른 검색어를 시도해보세요.</p>
      </div>
    );
  }

  return (
    <div>
      <>
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </>

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
            <span>상품 불러오는 중...</span>
          </div>
        </div>
      )}

      {!hasNextPage && products.length > 0 && (
        <div className="text-center py-8 text-gray-500" aria-live="polite">
          <p className="text-sm font-medium">더 이상 불러올 상품이 없습니다.</p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" aria-hidden="true"></div>
    </div>
  );
}
