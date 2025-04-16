'use client';

import { memo } from 'react';

import { SearchX, Package } from 'lucide-react';

import ViewModeToggle from '@/app/product-list/_components/view-mode-toggle';

interface ProductListHeaderProps {
  query?: string;
  totalCount: number;
  isLoading: boolean;
}

function ProductListHeader({ query, totalCount, isLoading }: ProductListHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        <div
          className="text-xs sm:text-sm text-gray-600 flex items-center flex-shrink min-w-0"
          id="products-info"
          aria-live="polite"
        >
          {isLoading ? (
            <div className="animate-pulse h-4 sm:h-5 bg-slate-200 rounded w-32 sm:w-40"></div>
          ) : query ? (
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
              <Package size={14} className="text-nsBlue-100 mr-1 flex-shrink-0 sm:w-4 sm:h-4 md:w-[16px] md:h-[16px]" />
              <span className="font-medium text-gray-800 flex-shrink-0">{totalCount}</span>
              <span className="flex-shrink-0">개의 결과</span>
              <span className="inline-flex items-center bg-nsBlue-100/10 text-nsBlue-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium truncate max-w-[80px] sm:max-w-none">
                {query}
              </span>
              {totalCount === 0 && (
                <div className="hidden sm:flex items-center ml-2 text-amber-600">
                  <SearchX size={12} className="mr-1 sm:w-[14px] sm:h-[14px]" />
                  <span className="text-xs whitespace-nowrap">일치하는 결과가 없습니다.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Package size={14} className="text-nsBlue-100 mr-1 flex-shrink-0 sm:w-4 sm:h-4 md:w-[16px] md:h-[16px]" />
              <span className="flex-shrink-0">총</span>
              <span className="font-medium text-gray-800 flex-shrink-0">{totalCount}</span>
              <span className="flex-shrink-0">개의 상품</span>
            </div>
          )}
        </div>
        <ViewModeToggle />
      </div>
      {!isLoading && query && totalCount === 0 && (
        <div className="flex sm:hidden items-center justify-center mt-2 text-amber-600 w-full">
          <SearchX size={12} className="mr-1" />
          <span className="text-xs">일치하는 결과가 없습니다.</span>
        </div>
      )}
    </div>
  );
}

export default memo(ProductListHeader);
