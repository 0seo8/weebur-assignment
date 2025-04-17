# WEEBUR 프론트엔드 코딩 과제

위버 프론트엔드 과제 제출 프로젝트입니다. DummyJSON API를 활용한 상품 리스트 페이지 구현입니다.

🔗 **데모:** ([데모](https://weebur-assignment.vercel.app/))

## 프로젝트 개요

이 프로젝트는 DummyJSON API를 사용해 반응형 상품 리스트 페이지를 구현했습니다. Next.js 15의 App Router와 React Query를 활용해 성능 최적화와 사용자 경험을 극대화했습니다.

> **회고록**: 프로젝트 개발 과정과 기술적 도전, 그리고 배운 점에 대한 상세한 회고는 [RETROSPECTIVE.md](./RETROSPECTIVE.md) 파일에서 확인하실 수 있습니다.

## 구현 기능

- **상품 리스트**:
  - 리스트형(1개/줄) 및 그리드형(4개/줄) 뷰 모드 구현
  - 최초 진입 시 50% 확률로 뷰 모드 랜덤 선택, 24시간 유지
  - 상품 카드에 상품명, 상품설명, 썸네일, 별점, 리뷰 수 표시
- **검색/필터**:
  - 상품명 검색 및 별점 내림차순 정렬 기능
  - URL 쿼리 파라미터로 필터 상태 유지
  - 검색 결과 없음 시 '일치하는 결과가 없습니다' 메시지 표시
- **무한 스크롤**:
  - Intersection Observer를 활용한 페이지 하단 감지
  - 페이지 하단 도달 시 다음 20개 아이템 자동 로드
  - 필터 결과에도 무한 스크롤 적용
  - 마지막 데이터까지 로딩 시 '더 이상 불러올 수 없습니다' 메시지 표시
  - 맨 위로 스크롤하는 버튼 구현
- **반응형 UI**:
  - 모바일(1열), 태블릿(2열), 데스크톱(4열) 최적화
  - 다양한 화면 크기에 맞는 UI 컴포넌트 조정

## 기술 스택

- **Next.js 15 (App Router)**: 서버 컴포넌트 및 클라이언트 컴포넌트 분리
- **TypeScript**: 타입 안전성 확보 및 개발 경험 향상
- **Tailwind CSS v5**: 반응형 디자인 및 스타일링
- **TanStack React Query**: 데이터 페칭, 캐싱, 무한 스크롤 구현
- **Zustand**: 뷰 모드 상태 관리 및 로컬 스토리지 연동
- **React Hook Form**: 검색 폼 관리
- **Lucide React**: 아이콘

## 실행 방법

1. 저장소 클론:

   ```bash
   git clone https://github.com/your-username/weebur-frontend-test.git
   cd weebur-frontend-test
   ```

2. 종속성 설치:

   ```bash
   npm install
   # 또는
   yarn install
   # 또는
   pnpm install
   ```

3. 개발 서버 실행:

   ```bash
   npm run dev
   # 또는
   yarn dev
   # 또는
   pnpm dev
   ```

4. 브라우저에서 접속:
   ```
   http://localhost:3000/product-list
   ```

## 프로젝트 구조

```
/src
  /api              # API 호출 함수
  /app              # 페이지와 레이아웃
    /product-list   # 상품 리스트 페이지
      /_components  # 상품 리스트 관련 컴포넌트
  /components       # 공통 UI 컴포넌트
  /hooks            # 커스텀 훅
  /store            # Zustand 상태 관리
  /types            # TypeScript 타입 정의
```

## 구현 최적화

- **서버 컴포넌트**: 초기 데이터 페칭으로 로드 시간 단축
- **React Query 캐싱**: 효율적인 데이터 관리 및 재요청 최소화
- **Intersection Observer**: 부드러운 무한 스크롤 구현
- **URL 쿼리 파라미터**: 필터 상태 유지 및 공유 가능
- **디바운스 처리**: 검색 입력 시 불필요한 API 호출 방지
- **반응형 컴포넌트**: 모든 화면 크기에서 최적의 사용자 경험 제공
- **로딩 상태 및 에러 처리**: 스켈레톤 UI와 명확한 오류 메시지

## 사용자 경험 개선

- **스크롤 상단 이동 버튼**: 긴 목록 탐색 시 편의성 제공
- **애니메이션 효과**: 부드러운 전환 및 인터랙션 피드백
- **접근성 고려**: ARIA 속성 및 키보드 접근성 지원
- **모바일 최적화**: 터치 친화적 UI 및 적절한 터치 타겟 크기

## 코드 품질

- **TypeScript 엄격 모드**: 타입 안전성 강화
- **함수형 컴포넌트**: React Hooks 활용한 현대적 패턴
- **모듈화된 설계**: 재사용 가능한 컴포넌트로 구성
- **일관된 스타일**: Tailwind CSS 클래스 조합의 일관성 유지
