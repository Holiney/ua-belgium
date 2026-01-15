import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if env variables are missing (for development)
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isBackendReady = isSupabaseConfigured;

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Database helpers for listings
export const getListings = async (table, filters = {}) => {
  console.log('=== getListings START ===');
  console.log('Table:', table);
  console.log('Filters:', filters);
  console.log('Supabase client exists:', !!supabase);

  if (!supabase) {
    console.error('Supabase client is null!');
    return { data: [], error: new Error('Supabase not configured') };
  }

  try {
    // First, try to get ALL records without any filters to diagnose
    console.log('Fetching ALL records from', table, '(no filters for debug)...');
    const { data: allData, error: allError } = await supabase
      .from(table)
      .select('*');

    console.log('ALL records result:', {
      count: allData?.length,
      error: allError,
      statuses: allData?.map(r => r.status),
      firstRecord: allData?.[0]
    });

    // Now apply filters
    let query = supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    // Only filter by status if explicitly requested or default to active
    if (filters.status !== undefined) {
      query = query.eq('status', filters.status);
    } else if (filters.includeAll !== true) {
      // Default: filter by active status
      query = query.eq('status', 'active');
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    console.log('Filtered result for', table, ':', { data, error, count: data?.length });
    console.log('=== getListings END ===');
    return { data: data || [], error };
  } catch (err) {
    console.error('getListings exception:', err);
    return { data: [], error: err };
  }
};

export const createListing = async (table, listing) => {
  const { data, error } = await supabase
    .from(table)
    .insert([listing])
    .select()
    .single();
  return { data, error };
};

export const updateListing = async (table, id, updates) => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteListing = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  return { error };
};

// Profile helpers
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// File upload helper
export const uploadImage = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) return { error };

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: publicUrl, error: null };
};
