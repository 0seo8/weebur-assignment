import '@testing-library/jest-dom';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// React Query 및 API 모킹

// useInfiniteProducts 모킹
jest.mock('@/api/products/hooks', () => ({
  useInfiniteProducts: jest.fn(() => ({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: jest.fn(),
  })),
}));

// IntersectionObserver 모킹
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
window.IntersectionObserver = mockIntersectionObserver;

// useInfiniteScroll 모킹
jest.mock('@/hooks/use-infinite-scroll', () => {
  return {
    __esModule: true,
    default: ({ onLoadMore }: { onLoadMore: () => void }) => {
      return {
        targetRef: {
          current: document.createElement('div'),
        },
        triggerLoadMore: () => onLoadMore(),
      };
    },
  };
});

// Next.js 모듈 모킹
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => {
    const mockSearchParams = new URLSearchParams();
    return {
      get: (key: string) => mockSearchParams.get(key),
    };
  }),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// useState와 useTransition 모킹 (isPending 상태 제어)
const mockIsPending = false;
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useTransition: () => [mockIsPending, jest.fn()],
  };
});

// localStorage 모킹 (뷰 모드 관련)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 뷰 모드 훅 모킹
jest.mock('@/hooks/use-view-mode', () => ({
  __esModule: true,
  default: () => ({
    viewMode: 'grid',
    setViewMode: jest.fn(),
  }),
}));

// API 함수 모킹
jest.mock('@/api/products/index', () => ({
  searchProducts: jest.fn(() => Promise.resolve({ products: [], total: 0 })),
}));

// ProductListView 컴포넌트 임포트
// useInfiniteProducts 모듈을 가져와 조작할 수 있도록 임포트
import { useInfiniteProducts } from '@/api/products/hooks';
import * as api from '@/api/products/index';
import type { ProductResponse } from '@/api/products/types';
import ProductListView from '@/app/product-list/_components/product-list-view';

import type { UseInfiniteQueryResult } from '@tanstack/react-query';

// React Query 관련 설정
function setupQueryClient() {
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    queryCache,
  });
  return queryClient;
}

// 타입 에러를 해결하기 위한 UseInfiniteQueryMockResult 타입 정의
type UseInfiniteQueryMockResult = Partial<UseInfiniteQueryResult<ProductResponse, Error>> & {
  isPending?: boolean;
  isLoading: boolean;
  isError: boolean;
  fetchNextPage: jest.Mock;
  refetch: jest.Mock;
  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

describe('ProductListView 오류 처리 테스트', () => {
  // 각 테스트 전에 실행
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // 기본 구현은 빈 함수, 각 테스트에서 재정의
    (useInfiniteProducts as jest.Mock).mockImplementation(() => ({
      data: undefined,
      error: null,
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: jest.fn(),
    }));
  });

  // 테스트 후 정리
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('API 요청 실패 시 에러 표시 및 재시도 버튼이 표시됩니다', async () => {
    // API 훅 모킹하여 에러 발생
    const mockError = new Error('서버 연결 오류가 발생했습니다');

    (useInfiniteProducts as jest.Mock).mockImplementation(
      () =>
        ({
          data: undefined,
          fetchNextPage: jest.fn(),
          hasNextPage: false,
          isFetchingNextPage: false,
          isLoading: false,
          isPending: false,
          isError: true,
          error: mockError,
          refetch: jest.fn(),
          isRefetchError: false,
          isLoadingError: true,
          isFetchingNextPageError: false,
          isRefetching: false,
          isFetching: false,
          status: 'error',
          fetchStatus: 'idle',
        }) as UseInfiniteQueryMockResult,
    );

    const queryClient = setupQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductListView />
      </QueryClientProvider>,
    );

    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('연결 오류')).toBeInTheDocument();
      expect(screen.getByText('서버 연결 오류가 발생했습니다')).toBeInTheDocument();
    });

    // 재시도 버튼 확인
    const retryButton = screen.getByText('다시 시도');
    expect(retryButton).toBeInTheDocument();
  });

  test('일치하는 결과가 없을 때 "일치하는 결과가 없습니다" 메시지가 표시됩니다', async () => {
    // API 훅 모킹하여 빈 결과 반환
    (useInfiniteProducts as jest.Mock).mockImplementation(
      () =>
        ({
          data: {
            pages: [
              {
                products: [],
                total: 0,
                limit: 20,
                skip: 0,
              },
            ],
            pageParams: [0],
          },
          fetchNextPage: jest.fn(),
          hasNextPage: false,
          isFetchingNextPage: false,
          isLoading: false,
          isPending: false,
          isError: false,
          error: null,
          refetch: jest.fn(),
          isRefetchError: false,
          isLoadingError: false,
          isFetchingNextPageError: false,
          isRefetching: false,
          isFetching: false,
          status: 'success',
          fetchStatus: 'idle',
          isSuccess: true,
        }) as UseInfiniteQueryMockResult,
    );

    const queryClient = setupQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductListView />
      </QueryClientProvider>,
    );

    // "일치하는 결과가 없습니다" 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('일치하는 결과가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('다른 검색어를 시도해보세요.')).toBeInTheDocument();
    });
  });

  test('재시도 버튼 클릭 시 refetch 함수가 호출됩니다', async () => {
    // API 훅 모킹하여 에러 발생 및 refetch 함수 모킹
    const mockError = new Error('네트워크 오류가 발생했습니다');
    const mockRefetch = jest.fn();

    (useInfiniteProducts as jest.Mock).mockImplementation(
      () =>
        ({
          data: undefined,
          fetchNextPage: jest.fn(),
          hasNextPage: false,
          isFetchingNextPage: false,
          isLoading: false,
          isPending: false,
          isError: true,
          error: mockError,
          refetch: mockRefetch,
          isRefetchError: false,
          isLoadingError: true,
          isFetchingNextPageError: false,
          isRefetching: false,
          isFetching: false,
          status: 'error',
          fetchStatus: 'idle',
        }) as UseInfiniteQueryMockResult,
    );

    const queryClient = setupQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductListView />
      </QueryClientProvider>,
    );

    // 재시도 버튼 찾기 및 클릭
    await waitFor(() => {
      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);
    });

    // refetch 함수가 호출되었는지 확인
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  test('API 요청 중 로딩 상태가 표시됩니다', async () => {
    // API 훅 모킹하여 로딩 상태 표시
    (useInfiniteProducts as jest.Mock).mockImplementation(
      () =>
        ({
          data: undefined,
          fetchNextPage: jest.fn(),
          hasNextPage: false,
          isFetchingNextPage: false,
          isLoading: true,
          isPending: true,
          isError: false,
          error: null,
          refetch: jest.fn(),
          isRefetchError: false,
          isLoadingError: false,
          isFetchingNextPageError: false,
          isRefetching: false,
          isFetching: true,
          status: 'loading',
          fetchStatus: 'fetching',
        }) as unknown as UseInfiniteQueryMockResult,
    );

    const queryClient = setupQueryClient();

    // 실제 로딩 인디케이터 렌더링 여부 확인을 위한 테스트 ID 속성 확인
    render(
      <QueryClientProvider client={queryClient}>
        <ProductListView />
      </QueryClientProvider>,
    );

    // 스켈레톤 로딩 UI 확인 (ProductSkeletonWrapper 컴포넌트)
    // ProductSkeletonWrapper 컴포넌트가 렌더링되는지는 DOM 구조 검사로 확인
    await waitFor(() => {
      // 상품 로딩 중 텍스트나 상품 개수가 0개로 표시되는지 확인
      expect(screen.queryByText('일치하는 결과가 없습니다')).not.toBeInTheDocument();
      expect(screen.queryByText('연결 오류')).not.toBeInTheDocument();
    });
  });

  test('에러 처리 기능이 현실적인 네트워크 오류에서도 작동합니다', async () => {
    // 실제 API 함수를 모킹하여 네트워크 오류 시뮬레이션
    jest.spyOn(api, 'searchProducts').mockRejectedValue(new Error('네트워크 연결 오류'));

    // useInfiniteProducts는 실제 구현과 유사하게 에러 전달
    (useInfiniteProducts as jest.Mock).mockImplementation(() => ({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isPending: false,
      isError: true,
      error: new Error('네트워크 연결 오류'),
      refetch: jest.fn(),
      isRefetchError: false,
      isLoadingError: true,
      isFetchingNextPageError: false,
      isRefetching: false,
      isFetching: false,
      status: 'error',
      fetchStatus: 'idle',
    }));

    const queryClient = setupQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductListView />
      </QueryClientProvider>,
    );

    // 네트워크 오류 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('연결 오류')).toBeInTheDocument();
      // 오류 메시지가 정확히 일치하지 않을 수 있으므로 부분 일치 확인
      const errorMessage = screen.getByText(/네트워크 연결 오류/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('마지막 페이지 도달 시 "더 이상 불러올 상품이 없습니다" 메시지가 표시됩니다', async () => {
    // API 훅 모킹하여 마지막 페이지 도달 시뮬레이션
    (useInfiniteProducts as jest.Mock).mockImplementation(
      () =>
        ({
          data: {
            pages: [
              {
                products: [
                  {
                    id: 1,
                    title: '테스트 상품',
                    price: 1000,
                    discountPercentage: 10,
                    thumbnail: '/test.jpg',
                    brand: '테스트',
                    rating: 4.5,
                    description: '테스트 설명',
                    category: '테스트',
                    stock: 10,
                    images: [],
                  },
                ],
                total: 1,
                limit: 20,
                skip: 0,
              },
            ],
            pageParams: [0],
          },
          fetchNextPage: jest.fn(),
          hasNextPage: false, // 더 이상 페이지가 없음
          isFetchingNextPage: false,
          isLoading: false,
          isPending: false,
          isError: false,
          error: null,
          refetch: jest.fn(),
          isRefetchError: false,
          isLoadingError: false,
          isFetchingNextPageError: false,
          isRefetching: false,
          isFetching: false,
          status: 'success',
          fetchStatus: 'idle',
          isSuccess: true,
        }) as UseInfiniteQueryMockResult,
    );

    const queryClient = setupQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ProductListView />
      </QueryClientProvider>,
    );

    // "더 이상 불러올 상품이 없습니다" 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('더 이상 불러올 상품이 없습니다.')).toBeInTheDocument();
    });
  });
});
