import { useEffect, useRef, useCallback, useState } from 'react';

const createIntersectionObserver = (callback: IntersectionObserverCallback, rootMargin = '0px 0px 300px 0px') =>
  new IntersectionObserver(callback, { rootMargin });

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  resetTrigger?: unknown;
  rootMargin?: string;
}

export default function useInfiniteScroll({
  onLoadMore,
  hasNextPage,
  isLoading,
  resetTrigger,
  rootMargin,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [shouldInitObserver, setShouldInitObserver] = useState(true);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasNextPage, isLoading],
  );

  useEffect(() => {
    if (resetTrigger) {
      setShouldInitObserver(true);
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (targetRef.current && shouldInitObserver) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = createIntersectionObserver(handleObserver, rootMargin);
      observerRef.current.observe(targetRef.current);

      setShouldInitObserver(false);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, shouldInitObserver, rootMargin]);

  return { targetRef };
}
