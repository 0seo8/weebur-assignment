import { useInfiniteQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/constants';
import { searchProducts } from '@/api/products/index';

import type { ProductResponse } from './types';

const DEFAULT_LIMIT = 20;

export type InfiniteProductResponse = {
  pages: ProductResponse[];
  pageParams: number[];
};

export interface UseInfiniteProductsOptions {
  sort?: 'rating-desc';
  searchQuery?: string;
  initialData?: InfiniteProductResponse;
}

export function useInfiniteProducts(options?: UseInfiniteProductsOptions) {
  const searchQuery = options?.searchQuery;
  const sort = options?.sort;

  return useInfiniteQuery<ProductResponse>({
    queryKey: QUERY_KEYS.PRODUCTS.infinite({
      searchQuery,
      sort,
    }),
    queryFn: ({ pageParam }) => {
      const skip = pageParam as number;
      return searchProducts({
        query: searchQuery || '*',
        skip,
        limit: DEFAULT_LIMIT,
        sort,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { total, limit, skip } = lastPage;
      const nextSkip = skip + limit;
      return nextSkip < total ? nextSkip : undefined;
    },
    ...(options?.initialData ? { initialData: options.initialData } : {}),
  });
}
