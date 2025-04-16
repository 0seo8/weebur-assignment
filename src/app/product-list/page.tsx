import { Suspense } from 'react';

import { getProducts } from '@/api/products';
import type { ProductResponse } from '@/api/products/types';
import ProductListView from '@/app/product-list/_components/product-list-view';
import SearchForm from '@/components/ui/search-form';
import { ProductSkeletonWrapper } from '@/components/ui/skeleton';

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params?.q || '';
  const sort = params?.sort === 'rating-desc' ? 'rating-desc' : undefined;

  const productsPromise = getProducts({
    select: [
      'id',
      'title',
      'description',
      'price',
      'discountPercentage',
      'rating',
      'stock',
      'brand',
      'category',
      'thumbnail',
      'tags',
      'reviews',
    ],
    sort,
    ...(query ? { searchQuery: query } : {}),
  });

  return (
    <>
      <SearchForm currentPath="/product-list" />
      <Suspense fallback={<ProductSkeletonWrapper itemCount={12} />}>
        <ProductData productsPromise={productsPromise} />
      </Suspense>
    </>
  );
}

async function ProductData({ productsPromise }: { productsPromise: Promise<ProductResponse> }) {
  const initialData = await productsPromise;

  return (
    <ProductListView
      initialData={{
        pages: [initialData],
        pageParams: [0],
      }}
    />
  );
}
