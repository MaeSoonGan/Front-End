import { useEffect } from 'react';

interface UseInfiniteScrollParams {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  target: HTMLElement | null;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  target,
}: UseInfiniteScrollParams) {
  useEffect(() => {
    if (!target || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoading) {
          return;
        }

        onLoadMore();
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, target]);
}
