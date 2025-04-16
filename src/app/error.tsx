'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('페이지 오류:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-5">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-600 mb-4">문제가 발생했습니다</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          페이지를 로드하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={() => reset()}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
