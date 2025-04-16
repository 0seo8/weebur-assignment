'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import useDebounce from '@/hooks/use-debouce';

interface SearchFormProps {
  currentPath?: string;
}

export default function SearchForm({ currentPath = '/' }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortByRating, setSortByRating] = useState(searchParams.get('sort') === 'rating-desc');

  const debouncedSearch = useDebounce((query: string, sort: boolean) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sort) params.set('sort', 'rating-desc');

    router.push(`${currentPath}?${params.toString()}`);
  }, 300);

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

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSortByRating(searchParams.get('sort') === 'rating-desc');
  }, [searchParams]);

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              value={searchQuery}
              onChange={handleQueryChange}
              placeholder="검색어를 입력하세요"
              className="w-full py-3 ps-10 pe-4 rounded-lg text-sm text-gray-700 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={sortByRating} onChange={handleSortChange} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-amber-400 peer-focus:ring-2 peer-focus:ring-amber-300"></div>
              <div className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition peer-checked:translate-x-5"></div>
            </div>
            <span className="text-sm font-medium text-gray-600">별점 높은 순</span>
          </label>
        </div>
      </div>
    </div>
  );
}
