# WEEBUR 과제 회고: React Query, Suspense, 무한 스크롤 문제 해결

## 1. React Query 뷰 갱신 문제

### 문제 상황
WEEBUR 과제의 검색 기능을 구현하던 중, React Query DevTools에서 네트워크 요청과 응답은 정상적으로 확인되었지만, UI가 갱신되지 않는 문제가 발생했습니다. 사용자가 검색어를 입력해도 이전 상품 리스트가 그대로 표시되어 검색 결과 반영이 안 됐습니다.

### 원인 분석
1. **캐시 정책 문제**:
    - 초기 `staleTime: 5분` 설정으로, URL 쿼리 파라미터(`q`, `sort`) 변경 시 캐시된 데이터를 재사용.
    - 쿼리 키 변경에도 새 데이터 페칭이 트리거되지 않음.
2. **수동 갱신 부족**:
    - 검색어/정렬 변경 시 `refetch` 호출 없어 자동 갱신 안 됨.
3. **복잡한 API 모듈**:
    - `getProducts`, `searchProducts`의 중복 로직과 조건부 URL 구성으로 디버깅 어려움.

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
    - `staleTime: 0`으로 검색 즉시 반영, `refetchOnWindowFocus: true`로 재방문 시 최신 데이터 보장.

2. **명시적 갱신**:
   ```typescript
   // /components/product/product-list.tsx
   useEffect(() => {
     if (query || sort) refetch();
   }, [query, sort, refetch]);
   ```
    - 검색어/정렬 변경 시 `refetch` 호출, UI 갱신 보장.

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
    - 공통 상수(`BASE_URL`), 단일 진입점 로직으로 중복 제거, 검색은 `no-store`로 최신성 보장.

4. **디버깅 로깅**:
   ```typescript
   useEffect(() => {
     console.log('검색어 또는 정렬 변경:', { query, sort });
     if (data) console.log('데이터 변경됨:', { total: data.pages[0]?.total, firstPage: data.pages[0]?.products.length });
   }, [query, sort, data]);
   ```
    - 검색어 변경과 데이터 갱신 추적, 캐시 문제 확인.

### 영향
- 검색 결과 미반영으로 사용자 혼란, 무한 스크롤이 이전 데이터로 동작.
- 해결 후 검색어(예: "lip") 입력 시 즉시 4개 결과 표시, UX 개선.

### 교훈
- **캐시 전략**: 검색 같은 동적 기능은 `staleTime: 0`, 정적 데이터는 ISR(`revalidate`)로 최적화.
- **명시적 갱신**: React Query의 자동 갱신 한계 이해, `refetch`로 보완.
- **API 단순화**: 중복 로직 제거로 디버깅과 유지보수성 향상.

## 2. Suspense와 스켈레톤 UI 문제

### 문제 상황
Next.js 15 서버 컴포넌트에서 `Suspense`로 `ProductData`를 감쌌지만, `fallback`으로 지정한 UI가 제대로 표시되지 않고 빈 화면이 나타났습니다.

### 원인 분석
1. **서버 페칭 즉시 완료**:
    - 서버 컴포넌트에서 `getProducts`의 결과를 `await`하고 바로 전달하여 `Suspense` 메커니즘을 우회했습니다.
2. **Suspense 경계 제한**:
    - `Suspense`가 클라이언트 측 로딩 상태를 제대로 포착하지 못했습니다.
3. **초기 데이터 우회**:
    - `initialData`로 클라이언트의 로딩 상태가 무시되었습니다.

### 해결 방법
1. **Suspense와 Promise 처리 개선**:
   ```tsx
   // /app/product-list/page.tsx
   export default async function Page({ searchParams }) {
     const params = await searchParams;
     const query = params?.q || '';
     const sort = params?.sort === 'rating-desc' ? 'rating-desc' : undefined;

     // Promise만 생성하고 즉시 해결하지 않음
     const productsPromise = getProducts({
       select: [/* 필요한 필드 */],
       sort,
       ...(query ? { searchQuery: query } : {}),
     });

     return (
       <>
         <SearchForm currentPath="/product-list" />
         <Suspense fallback={<ProductListView />}>
           <ProductData productsPromise={productsPromise} />
         </Suspense>
       </>
     );
   }

   async function ProductData({ productsPromise }) {
     // Promise를 여기서 해결하여 Suspense 메커니즘 작동
     const initialData = await productsPromise;
     
     return (
       <ProductListView
         initialData={{
           pages: [initialData],
           pageParams: [0],
         }}
       />
     );
   }
   ```
    - Promise를 즉시 해결하지 않고 `ProductData` 컴포넌트로 전달함
    - `ProductData` 내에서 Promise를 await하여 Suspense 메커니즘이 작동하도록 함
    - fallback으로 `ProductListView` 컴포넌트를 사용하여 일관된 UI 경험 제공

## 3. 무한 스크롤 이슈

### 문제 상황
컴포넌트 리팩토링 후 무한 스크롤이 첫 페이지(`skip: 0`)만 반복 요청하며 작동하지 않았습니다.

### 원인 분석
1. **상태 관리 분리**:
    - `useInfiniteScroll` 훅 분리로 클로저 문제, 최신 상태 참조 실패.
2. **Intersection Observer 불안정**:
    - 관찰 대상 요소 작아 감지 불안정, 리렌더링 시 재설정 문제.
3. **비동기 업데이트**:
    - 상태 업데이트와 관찰자 타이밍 불일치로 중복 요청.

### 해결 방법
1. **상태 기반 관찰자**:
   ```tsx
   const [observer, setObserver] = useState<IntersectionObserver | null>(null);
   useEffect(() => {
     const newObserver = new IntersectionObserver(
       (entries) => {
         const [entry] = entries;
         if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
           fetchNextPage();
         }
       },
       { rootMargin: '0px 0px 300px 0px' }
     );
     setObserver(newObserver);
     if (loadMoreRef.current) newObserver.observe(loadMoreRef.current);
     return () => newObserver.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
   ```

2. **감지 안정화**:
    - `rootMargin: 300px`로 조기 감지, 요소 크기(`h-4`) 유지.
   ```tsx
   <div ref={loadMoreRef} className="h-4" aria-hidden="true" />
   ```

### 영향
- 무한 스크롤 복구로 상품 목록 탐색 원활, 검색 결과 스크롤 자연스러움.

### 교훈
- **상태 동기화**: 비동기 훅 분리 시 최신 상태 보장, 클로저 주의.
- **관찰자 관리**: 리렌더링 시 재설정 명확히, 감지 요소 크기 적절히.

## 결론
React Query 뷰 갱신 문제는 캐시 정책과 명시적 갱신으로 해결하며 검색 UX를 개선했고, Suspense 문제는 클라이언트 로딩 관리로 스켈레톤 UI를 보장했다. 무한 스크롤 이슈는 상태 기반 관찰자 관리로 안정화했다. 이 과정에서 API 단순화, 디버깅 로그, Next.js 15의 서버-클라이언트 분리를 통해 코드 품질을 높였다. WEEBUR 과제의 사용자 친화적 UI와 기능 요구사항을 충족하며, 향후 프로젝트에 적용할 수 있는 체계적 문제 해결 경험을 얻었다.
