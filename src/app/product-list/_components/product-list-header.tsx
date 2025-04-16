'use client';

import { memo } from 'react';

import ViewModeToggle from '@/app/product-list/_components/view-mode-toggle';

interface ProductListHeaderProps {
  query?: string;
  totalCount: number;
  isLoading: boolean;
}

function ProductListHeader({ query, totalCount, isLoading }: ProductListHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600" id="products-info">
          {isLoading ? (
            <div className="animate-pulse h-5 bg-slate-200 rounded w-40"></div>
          ) : query ? (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{totalCount}</span>
              <span>개의 검색 결과</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">{query}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>총</span>
              <span className="font-medium text-gray-800">{totalCount}</span>
              <span>개의 상품</span>
            </div>
          )}
        </div>
        <ViewModeToggle />
      </div>
    </div>
  );
}

export default memo(ProductListHeader);
