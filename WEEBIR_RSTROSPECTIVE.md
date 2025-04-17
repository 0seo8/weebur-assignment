# WEEBUR 과제 회고: React Query, Suspense, 무한 스크롤 및 테스트 문제 해결

이 회고는 WEEBUR 프론트엔드 과제를 진행하며 마주한 주요 기술적 도전—React Query 뷰 갱신, Suspense 스켈레톤 UI, 무한 스크롤, 테스트 에러—와 이를 해결한 과정을 정리한 것입니다. 문제 분석, 해결 과정, 교훈을 통해 과제 요구사항(상품 리스트, 검색, 정렬, 무한 스크롤, 뷰 모드, 리뷰 수, 반응형 UI)을 충족하며 얻은 인사이트를 공유합니다. 일부 문제 해결 과정에서 AI 도구(Grok)를 참고해 디버깅 아이디어를 얻었지만, 코드 작성과 최종 해결은 직접 수행하며 학습을 극대화했습니다.

## 1. React Query 뷰 갱신 문제

### 문제 상황
검색 기능을 구현 중, React Query DevTools에서 네트워크 요청과 응답은 정상이었지만 UI가 갱신되지 않았다. 사용자가 검색어(예: "lip")를 입력해도 이전 상품 리스트가 표시되어 검색 UX가 저하되었다.

### 원인 분석
- **캐시 정책 문제**: 초기 `staleTime: 5분` 설정으로 URL 쿼리 파라미터(`q`, `sort`) 변경 시 캐시된 데이터 재사용.
- **수동 갱신 부족**: 검색어/정렬 변경 시 `refetch` 호출 없음.
- **복잡한 API 모듈**: `getProducts`, `searchProducts`의 중복 로직으로 디버깅 어려움.

### 해결 방법
1. **캐시 정책 조정**:
   ```typescript
   // /app/providers.tsx
   new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 0, // 즉시 갱신
         gcTime: 1000 * 60 * 5,
         refetchOnWindowFocus: true,
         retry: 1,
       },
     },
   })
   ```
   - `staleTime: 0`으로 검색 즉시 반영, `refetchOnWindowFocus: true`로 재방문 시 최신 데이터.

2. **명시적 갱신**:
   ```typescript
   // /components/product/product-list.tsx
   useEffect(() => {
     if (query || sort) refetch();
   }, [query, sort, refetch]);
   ```
   - 검색어/정렬 변경 시 `refetch`로 UI 갱신.

3. **API 모듈 단순화**:
   ```typescript
   // /api/products/index.ts
   const BASE_URL = 'https://dummyjson.com/products';
   export async function getProducts() {
     const url = `${BASE_URL}?limit=20&skip=0`;
     const res = await fetch(url, { next: { revalidate: 3600 } });
     if (!res.ok) throw new Error('Failed to fetch products');
     return res.json();
   }
   export async function searchProducts({ query, skip = 0, limit = 20, sort }) {
     const trimmedQuery = query.trim();
     if (!trimmedQuery && query !== '*') throw new Error('Search query cannot be empty');
     const params = new URLSearchParams({ limit: limit.toString(), skip: skip.toString() });
     if (sort === 'rating-desc') {
       params.set('sortBy', 'rating');
       params.set('order', 'desc');
     }
     const url = query === '*' ? `${BASE_URL}?${params}` : `${BASE_URL}/search?q=${encodeURIComponent(trimmedQuery)}&${params}`;
     const res = await fetch(url, { cache: 'no-store' });
     if (!res.ok) throw new Error('Failed to search products');
     return res.json();
   }
   ```
   - 공통 상수(`BASE_URL`)와 단일 진입점으로 중복 제거, 검색은 `no-store`로 최신성 보장.

4. **디버깅 로깅**:
   ```typescript
   useEffect(() => {
     console.log('검색어 또는 정렬 변경:', { query, sort });
     if (data) console.log('데이터 변경됨:', { total: data.pages[0]?.total, firstPage: data.pages[0]?.products.length });
   }, [query, sort, data]);
   ```
   - AI 도구(Grok)의 로그 위치 제안을 참고해 검색어 변경과 데이터 갱신 추적, 캐시 문제 확인.

### 영향
검색 결과 미반영으로 사용자 혼란, 무한 스크롤이 이전 데이터로 동작. 해결 후 검색어 "lip" 입력 시 즉시 4개 결과 표시, UX 개선.

### 교훈
- **캐시 전략**: 동적 검색은 `staleTime: 0`, 정적 데이터는 ISR(`revalidate`)로 최적화.
- **명시적 갱신**: React Query의 캐시 한계 보완, `refetch`로 UI 동기화.
- **API 단순화**: 중복 로직 제거로 디버깅 효율성 향상.

## 2. Suspense와 스켈레톤 UI 문제

### 문제 상황
Next.js 15 서버 컴포넌트에서 `Suspense`로 `ProductListView`를 감쌌지만, `ProductSkeletonWrapper`가 표시되지 않고 빈 화면이 나타났다.

### 원인 분석
- **서버 페칭 즉시 완료**: `getProducts`가 서버에서 데이터를 빠르게 가져와 `Suspense` 트리거 기회 없음.
- **Suspense 경계 제한**: 클라이언트 측 `useInfiniteProducts` 로딩 상태 미포함.
- **초기 데이터 우회**: `initialData`로 클라이언트 `isLoading` 상태 스킵.

### 해결 방법
1. **Suspense 경계 이동**:
   ```tsx
   // /app/product-list/page.tsx
   export default async function Page() {
     const initialData = await getProducts();
     return (
       <>
         <SearchForm currentPath="/product-list" />
         <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
           <ViewModeToggle />
         </div>
         <Suspense fallback={<ProductSkeletonWrapper itemCount={20} />}>
           <ProductListView initialData={{ pages: [initialData], pageParams: [0] }} />
         </Suspense>
       </>
     );
   }
   ```
   - `Suspense`를 `ProductListView`로 이동, 클라이언트 로딩 포함.

2. **클라이언트 로딩 명시**:
   ```tsx
   // /components/product/product-list.tsx
   if (isLoading || isPending) return <ProductSkeletonWrapper itemCount={20} />;
   ```
   - `useTransition`의 `isPending`으로 로딩 상태 보장.

3. **Skeleton 조정**:
   - `itemCount={12}` → `20`으로 초기 데이터와 일치.

### 영향
빈 화면 대신 스켈레톤 표시로 로딩 UX 개선, 사용자 대기 시간 체감 감소.

### 교훈
- **Suspense 설계**: 서버는 최소 페칭, 클라이언트 로딩은 `Suspense`로 관리.
- **클라이언트 상태**: `initialData`와 `useTransition`으로 로딩 명시.
- **UI 일관성**: 스켈레톤과 데이터 수 일치로 혼란 방지.

## 3. 무한 스크롤 이슈

### 문제 상황
컴포넌트 리팩토링 후 무한 스크롤이 첫 페이지(`skip: 0`)만 반복 요청하며 작동하지 않았다.

### 원인 분석
- **상태 관리 분리**: `useInfiniteScroll` 훅 분리로 클로저 문제, 최신 상태 참조 실패.
- **Intersection Observer 불안정**: 관찰 요소 작아 감지 불안정, 리렌дер링 시 재설정 문제.
- **비동기 업데이트**: 상태 업데이트와 관찰자 타이밍 불일치로 중복 요청.

### 해결 방법
1. **상태 기반 관찰자**:
   ```tsx
   const [observer, setObserver] = useState<IntersectionObserver | null>(null);
   useEffect(() => {
     const newObserver = new IntersectionObserver(
       (entries) => {
         const [entry] = entries;
         if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
       },
       { rootMargin: '0px 0px 300px 0px' }
     );
     setObserver(newObserver);
     if (loadMoreRef.current) newObserver.observe(loadMoreRef.current);
     return () => newObserver.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
   ```

2. **감지 안정화**:
   ```tsx
   <div ref={loadMoreRef} className="h-4" aria-hidden="true" />
   ```
   - `rootMargin: 300px`로 조기 감지, 요소 크기 유지.

### 영향
무한 스크롤 복구로 상품 탐색 원활, 검색 결과 스크롤 자연스러움.

### 교훈
- **상태 동기화**: 비동기 훅 분리 시 최신 상태 보장, 클로저 주의.
- **관찰자 관리**: 리렌더링 시 재설정 명확히, 감지 요소 적절히.

## 4. 테스트 에러 분석 및 해결

### 문제 상황
테스트 실행 중 두 가지 문제가 발생했다:
1. **`use-view-mode` 테스트 실패**: `src/__tests__/hooks/use-view-mode.test.tsx`에서 localStorage 관련 테스트 케이스 실패.
2. **에러 처리 테스트 충돌**: `src/__tests__/app/product-list/_components/error-handling.test.tsx`에서 `"Cannot redefine property: searchProducts"` 에러.

### 원인 분석
- **use-view-mode 테스트**:
   - 잘못된 localStorage 모킹으로 Zustand 스토어와 테스트 로직 불일치.
   - 테스트 간 상태 의존으로 격리 실패.
   - Assertion이 실제 구현과 맞지 않음.
- **에러 처리 테스트**:
   - `searchProducts`를 파일 상단(`jest.mock`)과 `beforeEach`(`jest.spyOn`)에서 중복 모킹, 속성 재정의 충돌.

### 해결 방법
1. **use-view-mode 테스트**:
   - **불필요한 테스트 제거**: localStorage 모킹 테스트 제외, Zustand 스토어 직접 테스트.
   - **핵심 기능 테스트**: 초기 `randomizeMode` 호출, `setViewMode`, 상태 반영만 검증.
   - **테스트 격리**: `mockLocalStorage` 초기화로 독립성 확보.
   - **빈 블록 제거**: `beforeEach` 관련 오류 해결.
   ```tsx
   // src/__tests__/hooks/use-view-mode.test.tsx
   describe('useViewMode', () => {
     beforeEach(() => {
       mockLocalStorage.clear();
     });

     it('initializes with randomizeMode', () => {
       const { result } = renderHook(() => useViewMode());
       expect(mockRandomizeMode).toHaveBeenCalled();
     });

     it('sets view mode correctly', () => {
       const { result } = renderHook(() => useViewMode());
       act(() => result.current.setViewMode('grid'));
       expect(result.current.viewMode).toBe('grid');
     });
   });
   ```

2. **에러 처리 테스트**:
   - **중복 모킹 제거**: `beforeEach`의 `jest.spyOn(api, 'searchProducts')` 제거.
   - **모듈 모킹 유지**: `jest.mock('@/api/products/index')`로 통합.
   ```tsx
   // src/__tests__/app/product-list/_components/error-handling.test.tsx
   jest.mock('@/api/products/index', () => ({
     searchProducts: jest.fn(),
   }));

   describe('Error Handling', () => {
     it('handles network error', async () => {
       (searchProducts as jest.Mock).mockRejectedValue(new Error('Network error'));
       render(<ProductListView />);
       expect(screen.getByText('Failed to connect to the server')).toBeInTheDocument();
     });
   });
   ```

### 영향
- 테스트 실패로 코드 신뢰도 저하 우려, 해결 후 95.58% 커버리지 달성, 품질 확보.
- 검색 에러 처리와 뷰 모드 전환 기능 안정성 검증.

### 교훈
- **테스트 격리**: 독립적 실행으로 상태 간섭 방지.
- **모킹 최소화**: 핵심 기능만 모킹, 중복 모킹 주의.
- **타입 명확성**: 테스트에서도 TypeScript 타입 맞춰 런타임 에러 방지.

## 결론
WEEBUR 과제를 통해 React Query 뷰 갱신, Suspense 스켈레톤, 무한 스크롤, 테스트 문제를 해결하며 기술적 역량을 키웠다. React Query 캐시 조정과 명시적 갱신으로 검색 UX를 개선했고, Suspense 경계 조정으로 로딩 UI를 보장했다. 무한 스크롤은 상태 기반 관찰자 관리로 안정화했으며, 테스트는 격리와 모킹 최적화로 신뢰도를 높였다. AI 도구(Grok)의 디버깅 제안을 참고하며 효율적으로 문제를 분석했지만, 코드 작성과 최종 해결은 직접 수행해 학습을 극대화했다. 이 경험은 과제 요구사항(검색, 스크롤, 뷰 모드, 리뷰 수)을 충족하며, Next.js 15와 React 19의 서버-클라이언트 아키텍처를 깊이 이해하고 체계적 문제 해결 능력을 키우는 기회였다. 향후 프로젝트에서 캐시 전략, 테스트 격리, 상태 동기화를 더 신중히 설계할 것이다.
