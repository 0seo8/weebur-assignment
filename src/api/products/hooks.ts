import { useInfiniteQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/constants';
import { getProducts } from '@/api/products/index';

import type { ProductResponse } from './types';

export function useInfiniteProducts(options?: { sort?: 'rating-desc' }) {
  return useInfiniteQuery<ProductResponse>({
    queryKey: QUERY_KEYS.PRODUCTS.infinite({ sort: options?.sort }),
    queryFn: ({ pageParam }) => {
      return getProducts({
        skip: pageParam as number,
        sort: options?.sort,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { total, limit, skip } = lastPage;
      const nextSkip = skip + limit;
      return nextSkip < total ? nextSkip : undefined;
    },
  });
}
