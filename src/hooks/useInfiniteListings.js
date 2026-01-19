import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getListingsPaginated, subscribeToListings, isBackendReady } from '../lib/supabase';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const PAGE_SIZE = 20;

/**
 * Hook for infinite scroll listings with TRUE instant display:
 * - Shows cached data IMMEDIATELY (no loading state if cache exists)
 * - Fetches fresh data silently in background
 * - Updates UI only when new data differs from cache
 */
export function useInfiniteListings(table, filters = {}) {
  // Get cached data SYNCHRONOUSLY for instant display
  const getCachedData = useCallback(() => {
    const cached = loadFromStorage(`${table}-items`, []);
    // Apply client-side filters to cached data for instant response
    if (cached.length === 0) return [];

    return cached.filter(item => {
      if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.city && filters.city !== 'all' && item.city !== filters.city) return false;
      if (filters.search && !item.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [table, filters]);

  const initialCache = useMemo(getCachedData, [getCachedData]);

  // State - show cached data IMMEDIATELY, no loading if cache exists
  const [listings, setListings] = useState(initialCache);
  const [isLoading, setIsLoading] = useState(initialCache.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(initialCache.length);
  const [error, setError] = useState(null);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // When filters change, immediately show filtered cache, then fetch
  useEffect(() => {
    const filteredCache = getCachedData();
    setListings(filteredCache);
    setTotal(filteredCache.length);
    // Only show loading if no cached data at all
    setIsLoading(filteredCache.length === 0);
    pageRef.current = 0;
    setHasMore(true);
  }, [getCachedData]);

  // Fetch a page of listings (silent background fetch)
  const fetchPage = useCallback(async (page, append = false, silent = false) => {
    if (!isBackendReady || isFetchingRef.current) return;

    isFetchingRef.current = true;

    // Only show loading states if NOT silent and no data
    if (!silent) {
      if (page === 0 && listings.length === 0) {
        setIsLoading(true);
      } else if (page > 0) {
        setIsLoadingMore(true);
      }
    } else {
      setIsBackgroundRefreshing(true);
    }

    try {
      const { data, error: fetchError, hasMore: more, total: count } = await getListingsPaginated(
        table,
        { page, pageSize: PAGE_SIZE, filters }
      );

      if (!mountedRef.current) return;

      if (fetchError) {
        setError(fetchError);
        return;
      }

      setListings(prev => {
        const newData = append ? [...prev, ...data] : data;
        // Save to localStorage for next instant display
        if (page === 0 && data.length > 0) {
          // Save unfiltered data for better cache
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
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsBackgroundRefreshing(false);
        isFetchingRef.current = false;
      }
    }
  }, [table, filters, listings.length]);

  // Initial fetch - SILENT if we have cache
  useEffect(() => {
    const hasCache = listings.length > 0;
    // Fetch silently in background if we have cache
    fetchPage(0, false, hasCache);
  }, [table, JSON.stringify(filters)]); // Re-fetch when filters change

  // Load more (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isFetchingRef.current) return;
    fetchPage(pageRef.current + 1, true, false);
  }, [hasMore, isLoadingMore, fetchPage]);

  // Manual refresh
  const refresh = useCallback(() => {
    pageRef.current = 0;
    setHasMore(true);
    fetchPage(0, false, false);
  }, [fetchPage]);

  // Realtime subscription for live updates
  useEffect(() => {
    if (!isBackendReady) return;

    const subscription = subscribeToListings(table, (payload) => {
      if (!mountedRef.current) return;

      const { eventType, new: newRecord, old: oldRecord } = payload;

      setListings(prev => {
        let updated;
        switch (eventType) {
          case 'INSERT':
            if (newRecord.status === 'active') {
              updated = [newRecord, ...prev];
              saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE * 2));
              return updated;
            }
            return prev;

          case 'UPDATE':
            updated = prev.map(item =>
              item.id === newRecord.id ? newRecord : item
            );
            saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE * 2));
            return updated;

          case 'DELETE':
            updated = prev.filter(item => item.id !== oldRecord.id);
            saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE * 2));
            return updated;

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
    setListings(prev => {
      const updated = [item, ...prev];
      saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE * 2));
      return updated;
    });
  }, [table]);

  const updateOptimistic = useCallback((id, updates) => {
    setListings(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE * 2));
      return updated;
    });
  }, [table]);

  const removeOptimistic = useCallback((id) => {
    setListings(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(`${table}-items`, updated.slice(0, PAGE_SIZE * 2));
      return updated;
    });
  }, [table]);

  return {
    listings,
    isLoading,
    isLoadingMore,
    isBackgroundRefreshing, // New: indicates silent refresh in progress
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
