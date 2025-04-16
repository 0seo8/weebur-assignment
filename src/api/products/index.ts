import api from '@/api';
import type { ProductResponse } from '@/api/products/types';

export interface ProductsParams {
  skip?: number;
  sort?: 'rating-desc';
}

export async function getProducts(options?: ProductsParams): Promise<ProductResponse> {
  const params = new URLSearchParams({
    limit: '20',
    skip: options?.skip?.toString() || '0',
  });

  if (options?.sort === 'rating-desc') {
    params.set('sortBy', 'rating');
    params.set('order', 'desc');
  }

  const url = `https://dummyjson.com/products?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
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
  limit = 20,
  sort,
}: SearchProductsParams): Promise<ProductResponse> {
  const isAllProducts = query === '*';

  let url = isAllProducts
    ? `/products?skip=${skip}&limit=${limit}`
    : `/products/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`;

  if (sort === 'rating-desc') {
    url += '&sortBy=rating&order=desc';
  }

  const { data } = await api.get<ProductResponse>(url);
  return data;
}
