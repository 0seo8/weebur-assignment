import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ProductListHeader from '@/app/product-list/_components/product-list-header';

// ViewModeToggle 컴포넌트 모킹
jest.mock('@/app/product-list/_components/view-mode-toggle', () => {
  return function MockViewModeToggle() {
    return <div data-testid="view-mode-toggle">뷰 모드 토글</div>;
  };
});

describe('ProductListHeader 컴포넌트', () => {
  test('로딩 상태를 표시합니다', () => {
    render(<ProductListHeader isLoading={true} totalCount={0} />);

    // 로딩 시 스켈레톤 UI가 표시됨
    const viewModeToggle = screen.getByTestId('view-mode-toggle');
    const parentElement = viewModeToggle.closest('div')?.parentElement;
    expect(parentElement).not.toBeNull();

    const skeletonElement = parentElement?.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
    expect(skeletonElement).toHaveClass('animate-pulse');

    // ViewModeToggle이 렌더링됨
    expect(viewModeToggle).toBeInTheDocument();
  });

  test('쿼리 없이 기본 상태를 표시합니다', () => {
    render(<ProductListHeader isLoading={false} totalCount={100} />);

    // "총 100개의 상품" 텍스트가 표시됨
    expect(screen.getByText('총')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('개의 상품')).toBeInTheDocument();

    // ViewModeToggle이 렌더링됨
    expect(screen.getByTestId('view-mode-toggle')).toBeInTheDocument();
  });

  test('검색 결과가 있는 경우를 표시합니다', () => {
    render(<ProductListHeader isLoading={false} totalCount={15} query="아이폰" />);

    // "15개의 결과" 텍스트가 표시됨
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('개의 결과')).toBeInTheDocument();

    // 검색어가 표시됨
    expect(screen.getByText('아이폰')).toBeInTheDocument();

    // "일치하는 결과가 없습니다" 메시지가 표시되지 않음
    expect(screen.queryByText(/일치하는 결과가 없습니다/)).not.toBeInTheDocument();

    // ViewModeToggle이 렌더링됨
    expect(screen.getByTestId('view-mode-toggle')).toBeInTheDocument();
  });

  test('검색 결과가 없는 경우를 표시합니다', () => {
    render(<ProductListHeader isLoading={false} totalCount={0} query="존재하지않는상품" />);

    // "0개의 결과" 텍스트가 표시됨
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('개의 결과')).toBeInTheDocument();

    // 검색어가 표시됨
    expect(screen.getByText('존재하지않는상품')).toBeInTheDocument();

    // "일치하는 결과가 없습니다" 메시지가 표시됨
    const noResultsElements = screen.getAllByText(/일치하는 결과가 없습니다/);
    expect(noResultsElements.length).toBeGreaterThan(0);

    // ViewModeToggle이 렌더링됨
    expect(screen.getByTestId('view-mode-toggle')).toBeInTheDocument();
  });

  test('aria-live 속성이 있는 영역이 존재합니다', () => {
    render(<ProductListHeader isLoading={false} totalCount={42} query="의자" />);

    // aria-live 속성이 있는 영역 찾기
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();

    // 해당 영역에 올바른 정보가 포함됨
    if (liveRegion) {
      expect(liveRegion.textContent).toContain('42');
      expect(liveRegion.textContent).toContain('의자');
    }
  });
});
