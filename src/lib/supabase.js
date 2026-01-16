import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendReady = !!(supabaseUrl && supabaseAnonKey);

// Lazy initialization - don't block app startup
let _supabaseInstance = null;
let _initPromise = null;

const initSupabase = () => {
  if (_supabaseInstance) return _supabaseInstance;

  _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  });
  return _supabaseInstance;
};

// Get supabase instance - initializes on first call
export const getSupabase = () => {
  if (!isBackendReady) return null;
  return initSupabase();
};

// For backwards compatibility - lazy getter
export const supabase = isBackendReady ? {
  get auth() { return getSupabase().auth; },
  from: (table) => getSupabase().from(table),
  storage: { get from() { return (bucket) => getSupabase().storage.from(bucket); } },
} : null;

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
  if (!supabase) {
    return { data: [], error: new Error('Supabase not configured') };
  }

  try {
    let query = supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter (default: active)
    if (filters.status !== undefined) {
      query = query.eq('status', filters.status);
    } else if (filters.includeAll !== true) {
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

    if (error) {
      console.error(`getListings(${table}) error:`, error.message);
    }

    return { data: data || [], error };
  } catch (err) {
    console.error(`getListings(${table}) exception:`, err);
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
