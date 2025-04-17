import { act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

import useViewMode from '@/hooks/use-view-mode';
import * as viewModeStore from '@/store/view-mode';

// localStorage 모킹을 위한 설정
type MockLocalStorage = {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
};

let mockLocalStorage: Record<string, string> = {};
const localStorageMock: MockLocalStorage = {
  getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage = {};
  }),
};

// localStorage 모킹
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

// 스토어를 모킹
jest.mock('@/store/view-mode', () => ({
  useViewMode: jest.fn().mockImplementation(() => ({
    mode: 'grid',
    setMode: jest.fn(),
    randomizeMode: jest.fn(),
  })),
}));

describe('useViewMode', () => {
  // 테스트 전에 모킹된 상태를 설정
  const mockSetMode = jest.fn();
  const mockRandomizeMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage = {};

    // 기본 스토어 상태 모킹 (타입 수정)
    (viewModeStore.useViewMode as unknown as jest.Mock).mockReturnValue({
      mode: 'grid',
      setMode: mockSetMode,
      randomizeMode: mockRandomizeMode,
    });
  });

  test('초기 렌더링 시 randomizeMode가 호출된다', () => {
    const { result } = renderHook(() => useViewMode());

    expect(mockRandomizeMode).toHaveBeenCalledTimes(1);
    expect(result.current.viewMode).toBe('grid');
  });

  test('setViewMode가 스토어의 setMode를 호출한다', () => {
    const { result } = renderHook(() => useViewMode());

    act(() => {
      result.current.setViewMode('list');
    });

    expect(mockSetMode).toHaveBeenCalledWith('list');
  });

  test('스토어 모드 변경이 훅의 viewMode 값에 반영된다', () => {
    // 초기 grid 모드로 렌더링
    const { result, rerender } = renderHook(() => useViewMode());
    expect(result.current.viewMode).toBe('grid');

    // 스토어 상태 변경을 모킹하고 다시 렌더링 (타입 수정)
    (viewModeStore.useViewMode as unknown as jest.Mock).mockReturnValue({
      mode: 'list',
      setMode: mockSetMode,
      randomizeMode: mockRandomizeMode,
    });

    rerender();

    // 변경된 모드가 반영되었는지 확인
    expect(result.current.viewMode).toBe('list');
  });

  // localStorage 관련 테스트는 모킹된 스토어에서 직접 테스트할 필요가 없어서 제거
  // view-mode 스토어 자체에 대한 테스트가 필요하다면 별도의 테스트 파일로 분리하는 것이 좋음
});
