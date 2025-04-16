import type { ProductResponse } from '@/api/products/types';

const BASE_URL = 'https://dummyjson.com/products';
const DEFAULT_LIMIT = 20;

export interface ProductsParams {
  skip?: number;
  sort?: 'rating-desc';
  select?: string[];
}

export async function getProducts(options?: ProductsParams): Promise<ProductResponse> {
  const params = new URLSearchParams({
    limit: DEFAULT_LIMIT.toString(),
    skip: options?.skip?.toString() || '0',
  });

  if (options?.sort === 'rating-desc') {
    params.set('sortBy', 'rating');
    params.set('order', 'desc');
  }

  if (options?.select && options.select.length > 0) {
    params.set('select', options.select.join(','));
  }

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`상품 데이터 요청 실패: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('상품 데이터 요청 오류:', error);
    throw error instanceof Error ? error : new Error('상품 데이터를 가져오는 중 오류가 발생했습니다');
  }
}

export interface SearchProductsParams {
  query: string;
  skip?: number;
  limit?: number;
  sort?: 'rating-desc';
}

export async function searchProducts({
  query,
  skip = 0,
  limit = DEFAULT_LIMIT,
  sort,
}: SearchProductsParams): Promise<ProductResponse> {
  const isAllProducts = query === '*';

  const params = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
  });

  if (sort === 'rating-desc') {
    params.set('sortBy', 'rating');
    params.set('order', 'desc');
  }

  // 검색인지 전체 조회인지에 따라 URL 설정
  let searchUrl: string;

  if (isAllProducts) {
    searchUrl = `${BASE_URL}?${params.toString()}`;
  } else {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) throw new Error('검색어가 비어 있습니다');
    params.set('q', encodeURIComponent(trimmedQuery));
    searchUrl = `${BASE_URL}/search?${params.toString()}`;
  }

  try {
    const res = await fetch(searchUrl, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`검색 요청 실패: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('검색 요청 오류:', error);
    throw error instanceof Error ? error : new Error('상품 검색 중 오류가 발생했습니다');
  }
}
