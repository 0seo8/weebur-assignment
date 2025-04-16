import { useEffect, useRef, useState } from 'react';

const createIntersectionObserver = (callback: IntersectionObserverCallback, rootMargin = '0px 0px 500px 0px') =>
  new IntersectionObserver(callback, { rootMargin, threshold: 0.1 });

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
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const hasCalledLoadMore = useRef(false);

  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;

    if (!isLoading) {
      hasCalledLoadMore.current = false;
    }
  }, [onLoadMore, isLoading]);

  useEffect(() => {
    if (observer) {
      observer.disconnect();
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry) return;

      if (entry.isIntersecting && hasNextPage && !isLoading && !hasCalledLoadMore.current) {
        hasCalledLoadMore.current = true;
        onLoadMoreRef.current();
      }
    };

    if (targetRef.current) {
      const newObserver = createIntersectionObserver(handleIntersection, rootMargin);
      newObserver.observe(targetRef.current);
      setObserver(newObserver);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [targetRef.current, resetTrigger, rootMargin]);

  return { targetRef };
}
