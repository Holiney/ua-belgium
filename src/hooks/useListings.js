import useSWR from 'swr';
import { getListings } from '../lib/supabase';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// Fetcher that saves to localStorage
const fetchListings = async (table) => {
  const { data, error } = await getListings(table);
  if (error) throw error;
  // Cache in localStorage for offline/instant access
  if (data) {
    saveToStorage(`${table}-items`, data);
  }
  return data || [];
};

// Hook for listings with instant cache display
export function useListings(table) {
  // Get cached data for instant display
  const cachedData = loadFromStorage(`${table}-items`, []);

  const { data, error, isLoading, mutate } = useSWR(
    table,
    fetchListings,
    {
      fallbackData: cachedData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 sec
      errorRetryCount: 2,
    }
  );

  return {
    listings: data || cachedData,
    isLoading: isLoading && cachedData.length === 0,
    error,
    refresh: mutate,
  };
}
