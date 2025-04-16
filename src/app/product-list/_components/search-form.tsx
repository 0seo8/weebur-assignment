'use client';

import { useEffect, useState, useTransition } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Loader2, Search } from 'lucide-react';

import useDebounce from '@/hooks/use-debouce';

interface SearchFormProps {
  currentPath?: string;
}

export default function SearchForm({ currentPath = '/' }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortByRating, setSortByRating] = useState(searchParams.get('sort') === 'rating-desc');
  const [isPending, startTransition] = useTransition();

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
    <form onSubmit={handleSubmit} className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
            <Search />
          </div>
          <input
            value={searchQuery}
            onChange={handleQueryChange}
            placeholder="검색어를 입력하세요"
            className="w-full py-3 ps-10 pe-4 rounded-lg text-sm text-gray-700 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
          />
        </div>

        <button
          disabled={isPending}
          type="submit"
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <span>검색 중</span>
            </>
          ) : (
            '검색'
          )}
        </button>

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
    </form>
  );
}
