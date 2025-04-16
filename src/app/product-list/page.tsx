import { Suspense } from 'react';

import { getProducts } from '@/api/products';
import type { ProductResponse } from '@/api/products/types';
import ProductListView from '@/app/product-list/_components/product-list-view';
import SearchForm from '@/components/ui/search-form';
import { ProductSkeleton } from '@/components/ui/skeleton';

export default async function Page() {
  const initialData: ProductResponse = await getProducts({
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
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            위버 상품 리스트
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            다양한 상품들을 탐색하고 검색해보세요. 리스트 뷰와 그리드 뷰로 자유롭게 볼 수 있습니다.
          </p>
        </header>

        <SearchForm currentPath="/product-list" />

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ProductSkeleton viewMode="grid" />
            </div>
          }
        >
          <ProductListView
            initialData={{
              pages: [initialData],
              pageParams: [0],
            }}
          />
        </Suspense>
      </div>
    </main>
  );
}
