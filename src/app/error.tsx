'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { Wifi, WifiOff, ServerOff, CircleAlert, Search, RefreshCw } from 'lucide-react';

type ErrorType = 'network' | 'server' | 'offline' | 'notFound' | 'generic';

interface ErrorProps {
  error: Error & { type?: ErrorType; digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // 에러 정보 기록
  useEffect(() => {
    console.error('페이지 오류:', error);
  }, [error]);

  let errorType: ErrorType = 'generic';

  if (error.type) {
    errorType = error.type;
  } else if (typeof error.message === 'string') {
    if (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch failed') ||
      error.message.toLowerCase().includes('failed to fetch')
    ) {
      errorType = 'network';
    } else if (error.message.toLowerCase().includes('500') || error.message.toLowerCase().includes('server error')) {
      errorType = 'server';
    }
  } else if (typeof window !== 'undefined' && !window.navigator.onLine) {
    errorType = 'offline';
  }

  const errorConfig: Record<ErrorType, { title: string; icon: React.ReactNode; message: string }> = {
    network: {
      title: '네트워크 오류',
      icon: <Wifi className="w-12 h-12 mx-auto mb-2" />,
      message: '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해 주세요.',
    },
    offline: {
      title: '오프라인 상태',
      icon: <WifiOff className="w-12 h-12 mx-auto mb-2" />,
      message: '인터넷 연결이 끊어졌습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.',
    },
    server: {
      title: '서버 오류',
      icon: <ServerOff className="w-12 h-12 mx-auto mb-2" />,
      message: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    },
    notFound: {
      title: '결과를 찾을 수 없음',
      icon: <Search className="w-12 h-12 mx-auto mb-2" />,
      message: '요청하신 정보를 찾을 수 없습니다.',
    },
    generic: {
      title: '오류가 발생했습니다',
      icon: <CircleAlert className="w-12 h-12 mx-auto mb-2" />,
      message: '페이지를 로드하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    },
  };

  const { title, icon, message } = errorConfig[errorType];
  const errorMessage = error.message || message;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-5">
      <div className="bg-white shadow-md p-6 sm:p-10 rounded-xl border border-gray-100 text-center max-w-lg">
        <div className="text-red-500 mb-4">
          {icon}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {errorMessage}
          {error.digest && <span className="block mt-2 text-xs text-gray-500">오류 코드: {error.digest}</span>}
        </p>

        <div className="space-x-3">
          <button
            onClick={() => reset()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </button>

          <Link
            href="/"
            className="inline-block text-gray-500 hover:text-gray-700 font-medium transition-colors px-3 py-2"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
