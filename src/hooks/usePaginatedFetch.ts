import { useState, useEffect, useCallback } from 'react';

interface PaginatedResponse<T> {
  content: T[];
  last: boolean;
}

interface UsePaginatedFetchOptions<T> {
  /** The fetch function. Must be memoized with useCallback to avoid unnecessary re-fetches. */
  fetchFn: (page: number, size: number) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
}

interface UsePaginatedFetchResult<T> {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  onRefresh: () => void;
  onLoadMore: () => void;
  refetch: () => void;
}

function usePaginatedFetch<T>({
  fetchFn,
  pageSize = 10,
}: UsePaginatedFetchOptions<T>): UsePaginatedFetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const fetchData = useCallback(
    async (pageNum: number, isRefreshing: boolean = false) => {
      try {
        if (pageNum === 0) {
          if (!isRefreshing) setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const response = await fetchFn(pageNum, pageSize);
        const newItems = response.content || [];

        if (pageNum === 0) {
          setData(newItems);
        } else {
          setData((prev) => [...prev, ...newItems]);
        }

        setHasMore(!response.last && newItems.length > 0);
        setPage(pageNum);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch data';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [fetchFn, pageSize],
  );

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(0, true);
  }, [fetchData]);

  const onLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchData(page + 1);
    }
  }, [loadingMore, hasMore, loading, page, fetchData]);

  const refetch = useCallback(() => {
    fetchData(0);
  }, [fetchData]);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    page,
    onRefresh,
    onLoadMore,
    refetch,
  };
}

export default usePaginatedFetch;
