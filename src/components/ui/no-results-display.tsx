'use client';

import React from 'react';

export default function NoResultsDisplay() {
  return (
    <div className="bg-white shadow-sm p-10 rounded-xl border border-gray-100 text-center">
      <div className="text-gray-400 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 mx-auto mb-2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <h2 className="text-lg font-medium">일치하는 결과가 없습니다</h2>
      </div>
      <p className="text-gray-600">다른 검색어를 시도해보세요.</p>
    </div>
  );
}
