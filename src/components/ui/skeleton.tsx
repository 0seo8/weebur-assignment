'use client';

import useViewMode from '@/hooks/use-view-mode';

interface ProductSkeletonProps {
  viewMode: 'list' | 'grid';
}

export const ProductSkeleton = ({ viewMode }: ProductSkeletonProps) => {
  const isGridMode = viewMode === 'grid';

  return (
    <div
      className={`animate-pulse rounded-xl border border-gray-100 overflow-hidden bg-white transition-all duration-200 ${
        isGridMode ? '' : 'flex sm:flex-row'
      }`}
    >
      <div className={`${isGridMode ? 'aspect-square' : 'w-full sm:w-1/3 h-48 sm:h-auto'} relative overflow-hidden`}>
        <div className="bg-slate-200 h-full w-full"></div>
        <div className="absolute top-3 left-3">
          <div className="h-5 w-14 bg-slate-300 rounded-full"></div>
        </div>
      </div>
      <div className={`p-5 ${isGridMode ? '' : 'flex-1'}`}>
        <div className="h-3 bg-slate-200 rounded w-1/5 mb-2"></div>
        <div className="h-6 bg-slate-300 rounded w-3/4 mb-2"></div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          {!isGridMode && (
            <>
              <div className="h-3 bg-slate-200 rounded w-[95%]"></div>
              <div className="h-3 bg-slate-200 rounded w-[90%]"></div>
            </>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <div className="h-5 w-5 bg-amber-200 rounded-full"></div>
            <div className="h-4 bg-slate-200 rounded w-10"></div>
            <div className="h-3 bg-slate-200 rounded w-14 ml-1"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 bg-slate-200 rounded w-10 mr-2"></div>
            <div className="h-6 bg-slate-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ProductSkeletonWrapper({ itemCount = 8 }: { itemCount?: number }) {
  const { viewMode } = useViewMode();

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'
          : 'space-y-4'
      }
      aria-label="상품 로딩 중"
      aria-busy="true"
    >
      {Array.from({ length: itemCount }).map((_, i) => (
        <ProductSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
