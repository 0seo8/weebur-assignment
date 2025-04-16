'use client';

import { Grid, List } from 'lucide-react';

import useViewMode from '@/hooks/use-view-mode';

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, mode: 'grid' | 'list') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setViewMode(mode);
    }
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-100 rounded-lg shadow-inner">
      <button
        onClick={() => setViewMode('grid')}
        onKeyDown={(e) => handleKeyDown(e, 'grid')}
        className={`flex items-center justify-center p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-white text-nsBlue-100 shadow-sm ring-1 sm:ring-2' + ' ring-nsBlue-100/30'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:bg-gray-200 focus:text-gray-700'
        }`}
        aria-label="그리드 뷰"
        title="그리드 뷰"
        aria-pressed={viewMode === 'grid'}
        tabIndex={0}
      >
        <Grid size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        onKeyDown={(e) => handleKeyDown(e, 'list')}
        className={`flex items-center justify-center p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-white text-nsBlue-100 shadow-sm ring-1 sm:ring-2' + ' ring-nsBlue-100/30'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:bg-gray-200 focus:text-gray-700'
        }`}
        aria-label="리스트 뷰"
        title="리스트 뷰"
        aria-pressed={viewMode === 'list'}
        tabIndex={0}
      >
        <List size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  );
}
