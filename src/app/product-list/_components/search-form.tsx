'use client';

import { useEffect, useState, useTransition } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Loader2, Search, SortDesc } from 'lucide-react';

import useDebounce from '@/hooks/use-debouce';

interface SearchFormProps {
  currentPath?: string;
}

export default function SearchForm({ currentPath = '/' }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortByRating, setSortByRating] = useState(searchParams.get('sort') === 'rating-desc');

  const updateSearchParams = (query: string, sort: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (sort) params.set('sort', 'rating-desc');

      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const debouncedSearch = useDebounce(updateSearchParams, 500);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    debouncedSearch(newQuery, sortByRating);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSort = e.target.checked;
    setSortByRating(newSort);
    debouncedSearch(searchQuery, newSort);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSearchParams(searchQuery, sortByRating);
  };

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSortByRating(searchParams.get('sort') === 'rating-desc');
  }, [searchParams]);

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6"
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
            <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <input
            value={searchQuery}
            onChange={handleQueryChange}
            placeholder="검색어를 입력하세요"
            className="w-full py-2 sm:py-3 ps-9 sm:ps-10 pe-4 rounded-lg text-sm text-gray-700 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nsBlue-100 focus:border-transparent transition-all duration-200"
            aria-label="검색어 입력"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                updateSearchParams('', sortByRating);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              <span className="text-xl">&times;</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 w-full sm:w-auto sm:justify-start">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={sortByRating}
                onChange={handleSortChange}
                className="sr-only peer"
                aria-label="별점 높은 순 정렬"
              />
              <div className="w-9 sm:w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-nsBlue-100 peer-focus:ring-2 peer-focus:ring-nsBlue-100/30 transition-colors duration-200"></div>
              <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-all duration-200 peer-checked:translate-x-4 sm:peer-checked:translate-x-5"></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
              <SortDesc size={12} className="sm:w-[14px] sm:h-[14px] mr-1" />
              별점 높은 순
            </span>
          </label>

          <button
            type="submit"
            className="bg-nsBlue-100 hover:bg-nsBlue-100/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-nsBlue-100/50 focus:ring-offset-2 flex items-center justify-center w-[90px] sm:w-[120px] h-[36px] sm:h-[40px]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>검색 중</span>
              </>
            ) : (
              '검색'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
