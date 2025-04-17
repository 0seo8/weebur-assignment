'use client';

import { useEffect } from 'react';

import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('치명적인 애플리케이션 오류:', error);
  }, [error]);

  const isOffline = typeof window !== 'undefined' && !window.navigator.onLine;

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50">
          <div className="bg-white shadow-lg p-8 rounded-xl border border-gray-100 text-center max-w-md">
            {isOffline ? (
              <>
                <WifiOff className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">오프라인 상태</h1>
                <p className="text-gray-600 mb-8">
                  인터넷 연결이 끊어졌습니다. 네트워크 연결을 확인하고 다시 시도해주세요.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">치명적인 오류 발생</h1>
                <p className="text-gray-600 mb-6">
                  서버에서 치명적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                  {error.digest && (
                    <span className="block mt-4 text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      오류 코드: {error.digest}
                    </span>
                  )}
                </p>
              </>
            )}

            <div className="mt-2">
              <button
                onClick={() => reset()}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
