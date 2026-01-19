import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getListingsPaginated, subscribeToListings, isBackendReady } from '../lib/supabase';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const PAGE_SIZE = 20;

/**
 * Hook for infinite scroll listings with:
 * - Pagination using Supabase .range()
 * - Realtime subscriptions for live updates
 * - Local caching for instant display
 * - Optimistic updates
 */
export function useInfiniteListings(table, filters = {}) {
  const cacheKey = useMemo(() => {
    const filterStr = JSON.stringify(filters);
    return `${table}-infinite-${filterStr}`;
  }, [table, filters]);

  // Get cached data for instant display
  const cachedData = useMemo(() => loadFromStorage(`${table}-items`, []), [table]);

  const [listings, setListings] = useState(cachedData);
  const [isLoading, setIsLoading] = useState(cachedData.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);
  const filtersRef = useRef(filters);

  // Track if filters changed
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(filtersRef.current);
    if (filtersChanged) {
      filtersRef.current = filters;
      pageRef.current = 0;
      setListings([]);
      setHasMore(true);
      setIsLoading(true);
    }
  }, [filters]);

  // Fetch a page of listings
  const fetchPage = useCallback(async (page, append = false) => {
    if (!isBackendReady || isFetchingRef.current) return;

    isFetchingRef.current = true;
    if (page === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { data, error: fetchError, hasMore: more, total: count } = await getListingsPaginated(
        table,
        { page, pageSize: PAGE_SIZE, filters }
      );

      if (fetchError) {
        setError(fetchError);
        return;
      }

      setListings(prev => {
        const newData = append ? [...prev, ...data] : data;
        // Save first page to localStorage for instant display next time
        if (page === 0) {
          saveToStorage(`${table}-items`, newData);
        }
        return newData;
      });
      setHasMore(more);
      setTotal(count);
      setError(null);
      pageRef.current = page;
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [table, filters]);

  // Initial fetch
  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  // Load more (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isFetchingRef.current) return;
    fetchPage(pageRef.current + 1, true);
  }, [hasMore, isLoadingMore, fetchPage]);

  // Refresh (reload from start)
  const refresh = useCallback(() => {
    pageRef.current = 0;
    setHasMore(true);
    fetchPage(0, false);
  }, [fetchPage]);

  // Realtime subscription
  useEffect(() => {
    if (!isBackendReady) return;

    const subscription = subscribeToListings(table, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setListings(prev => {
        switch (eventType) {
          case 'INSERT':
            // Add new item at the beginning
            if (newRecord.status === 'active') {
              const updated = [newRecord, ...prev];
              saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE));
              return updated;
            }
            return prev;

          case 'UPDATE':
            // Update existing item
            return prev.map(item =>
              item.id === newRecord.id ? newRecord : item
            );

          case 'DELETE':
            // Remove deleted item
            return prev.filter(item => item.id !== oldRecord.id);

          default:
            return prev;
        }
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [table]);

  // Optimistic update helpers
  const addOptimistic = useCallback((item) => {
    setListings(prev => [item, ...prev]);
  }, []);

  const updateOptimistic = useCallback((id, updates) => {
    setListings(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  }, []);

  const removeOptimistic = useCallback((id) => {
    setListings(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    listings,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    error,
    loadMore,
    refresh,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
  };
}
