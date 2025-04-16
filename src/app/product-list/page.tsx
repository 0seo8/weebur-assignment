import { Suspense } from 'react';

import { getProducts } from '@/api/products';
import SearchForm from '@/components/ui/search-form';

export default async function Page() {
  const initialData = await getProducts();
  console.log('initialData', initialData);
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">위버 상품 리스트</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">다양한 상품들을 탐색하고 검색해보세요.</p>
        </header>
        <SearchForm currentPath="/productlist" />
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              <span>총 </span>
              <span className="font-medium text-gray-800">{initialData.total}</span>
              <span>개의 상품</span>
            </div>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          {/* TODO: ProducList를 만들어서 내리기*/}
          {/*<ProductList initialData={{ pages: [initialData], pageParams: [0] }} />*/}
        </Suspense>
      </div>
    </main>
  );
}
