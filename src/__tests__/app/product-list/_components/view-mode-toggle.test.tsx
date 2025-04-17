import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

// Zustand 스토어 모킹
jest.mock('@/hooks/use-view-mode', () => {
  const mockSetViewMode = jest.fn();
  return jest.fn(() => ({
    viewMode: 'grid', // 기본 테스트는 grid 모드로 시작
    setViewMode: mockSetViewMode,
  }));
});

// 아이콘 컴포넌트 모킹
jest.mock('lucide-react', () => ({
  Grid: () => <div data-testid="grid-icon">Grid Icon</div>,
  List: () => <div data-testid="list-icon">List Icon</div>,
}));

import ViewModeToggle from '@/app/product-list/_components/view-mode-toggle';
import useViewMode from '@/hooks/use-view-mode';

describe('ViewModeToggle 컴포넌트', () => {
  let mockUseViewMode: jest.Mock;
  let mockSetViewMode: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetViewMode = jest.fn();
    mockUseViewMode = useViewMode as jest.Mock;
  });

  test('그리드 모드일 때 그리드 버튼이 활성화됩니다', () => {
    mockUseViewMode.mockReturnValue({
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
    });

    render(<ViewModeToggle />);

    // 그리드 버튼이 활성화되어 있는지 확인
    const gridButton = screen.getByLabelText('그리드 뷰');
    const listButton = screen.getByLabelText('리스트 뷰');

    expect(gridButton).toHaveAttribute('aria-pressed', 'true');
    expect(listButton).toHaveAttribute('aria-pressed', 'false');
    expect(gridButton).toHaveClass('bg-white');
    expect(listButton).not.toHaveClass('bg-white');
  });

  test('리스트 모드일 때 리스트 버튼이 활성화됩니다', () => {
    mockUseViewMode.mockReturnValue({
      viewMode: 'list',
      setViewMode: mockSetViewMode,
    });

    render(<ViewModeToggle />);

    // 리스트 버튼이 활성화되어 있는지 확인
    const gridButton = screen.getByLabelText('그리드 뷰');
    const listButton = screen.getByLabelText('리스트 뷰');

    expect(gridButton).toHaveAttribute('aria-pressed', 'false');
    expect(listButton).toHaveAttribute('aria-pressed', 'true');
    expect(gridButton).not.toHaveClass('bg-white');
    expect(listButton).toHaveClass('bg-white');
  });

  test('그리드 버튼 클릭 시 setViewMode가 grid로 호출됩니다', () => {
    mockUseViewMode.mockReturnValue({
      viewMode: 'list',
      setViewMode: mockSetViewMode,
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByLabelText('그리드 뷰');
    fireEvent.click(gridButton);

    expect(mockSetViewMode).toHaveBeenCalledWith('grid');
  });

  test('리스트 버튼 클릭 시 setViewMode가 list로 호출됩니다', () => {
    mockUseViewMode.mockReturnValue({
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
    });

    render(<ViewModeToggle />);

    const listButton = screen.getByLabelText('리스트 뷰');
    fireEvent.click(listButton);

    expect(mockSetViewMode).toHaveBeenCalledWith('list');
  });

  test('키보드로 그리드 버튼 활성화 시 setViewMode가 호출됩니다', () => {
    mockUseViewMode.mockReturnValue({
      viewMode: 'list',
      setViewMode: mockSetViewMode,
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByLabelText('그리드 뷰');

    // Enter 키 테스트
    fireEvent.keyDown(gridButton, { key: 'Enter' });
    expect(mockSetViewMode).toHaveBeenCalledWith('grid');

    mockSetViewMode.mockClear();

    // 스페이스바 테스트
    fireEvent.keyDown(gridButton, { key: ' ' });
    expect(mockSetViewMode).toHaveBeenCalledWith('grid');
  });

  test('아이콘이 올바르게 렌더링됩니다', () => {
    mockUseViewMode.mockReturnValue({
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
    });

    render(<ViewModeToggle />);

    expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
    expect(screen.getByTestId('list-icon')).toBeInTheDocument();
  });
});
