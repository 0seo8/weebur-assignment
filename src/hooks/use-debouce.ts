import { useCallback, useEffect, useRef } from 'react';

/**
 * 디바운스 기능을 제공하는 커스텀 훅
 * @param callback 디바운스할 콜백 함수
 * @param delay 지연 시간 (밀리초)
 * @returns 디바운스된 함수
 */
function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

export default useDebounce;
