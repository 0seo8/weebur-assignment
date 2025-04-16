'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('치명적인 애플리케이션 오류:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50">
          <div className="text-center max-w-md">
            <h1 className="text-5xl font-bold text-red-600 mb-6">서버 오류 발생</h1>
            <p className="text-gray-700 mb-8">
              서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              {error.digest && <span className="block mt-2 text-sm text-gray-500">오류 코드: {error.digest}</span>}
            </p>
            <button
              onClick={() => reset()}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              새로고침
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
