'use client';

import type { HTMLAttributes } from 'react';

import useViewMode from '@/hooks/use-view-mode';
import { cn } from '@/utils/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
        className,
      )}
      {...props}
    />
  );
}

interface ProductSkeletonProps {
  viewMode: 'list' | 'grid';
}

export const ProductSkeleton = ({ viewMode }: ProductSkeletonProps) => {
  const isGridMode = viewMode === 'grid';

  return (
    <div
      className={`animate-pulse rounded-xl border border-gray-100 overflow-hidden bg-white ${
        isGridMode ? '' : 'flex sm:flex-row'
      }`}
    >
      <div
        className={`bg-slate-200 ${
          isGridMode ? 'aspect-square' : 'w-full sm:w-1/3 h-48 sm:h-auto'
        } relative overflow-hidden`}
      ></div>
      <div className={`p-5 ${isGridMode ? '' : 'flex-1'}`}>
        <div className="h-2 bg-slate-200 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-full mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-3 bg-slate-200 rounded w-8"></div>
            <div className="h-2 bg-slate-200 rounded w-14 ml-2"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
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
        viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'
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
