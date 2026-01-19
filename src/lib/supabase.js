const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendReady = !!(supabaseUrl && supabaseAnonKey);

// Lazy initialization with dynamic import - don't block app startup
let _supabaseInstance = null;
let _initPromise = null;

const initSupabase = async () => {
  if (_supabaseInstance) return _supabaseInstance;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const { createClient } = await import('@supabase/supabase-js');
    _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    });
    return _supabaseInstance;
  })();

  return _initPromise;
};

// Get supabase instance - async now
export const getSupabaseAsync = async () => {
  if (!isBackendReady) return null;
  return initSupabase();
};

// Synchronous getter - returns null if not yet initialized
export const getSupabase = () => {
  if (!isBackendReady) return null;
  return _supabaseInstance;
};

// Start loading supabase in background immediately (but non-blocking)
if (isBackendReady) {
  // Use setTimeout to not block initial render
  setTimeout(() => initSupabase(), 0);
}

// For backwards compatibility - async proxy
export const supabase = isBackendReady ? {
  get auth() {
    if (!_supabaseInstance) {
      console.warn('Supabase not yet initialized, returning dummy auth');
      return {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        signInWithOtp: async () => ({ error: new Error('Not ready') }),
        verifyOtp: async () => ({ error: new Error('Not ready') }),
        signInWithPassword: async () => ({ error: new Error('Not ready') }),
      };
    }
    return _supabaseInstance.auth;
  },
  from: (table) => {
    if (!_supabaseInstance) {
      return {
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: new Error('Not ready') }),
        update: () => ({ data: null, error: new Error('Not ready') }),
        delete: () => ({ error: new Error('Not ready') }),
      };
    }
    return _supabaseInstance.from(table);
  },
  get storage() {
    return {
      from: (bucket) => {
        if (!_supabaseInstance) {
          return {
            upload: async () => ({ error: new Error('Not ready') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          };
        }
        return _supabaseInstance.storage.from(bucket);
      }
    };
  },
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

// Paginated listings fetch with .range()
export const getListingsPaginated = async (table, { page = 0, pageSize = 20, filters = {} } = {}) => {
  if (!supabase) {
    return { data: [], error: new Error('Supabase not configured'), hasMore: false, total: 0 };
  }

  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

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
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`getListingsPaginated(${table}) error:`, error.message);
      return { data: [], error, hasMore: false, total: 0 };
    }

    const total = count || 0;
    const hasMore = (page + 1) * pageSize < total;

    return { data: data || [], error: null, hasMore, total };
  } catch (err) {
    console.error(`getListingsPaginated(${table}) exception:`, err);
    return { data: [], error: err, hasMore: false, total: 0 };
  }
};

// Subscribe to realtime changes on a table
export const subscribeToListings = (table, callback) => {
  if (!_supabaseInstance) {
    console.warn('Supabase not initialized for realtime');
    return { unsubscribe: () => {} };
  }

  const channel = _supabaseInstance
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      _supabaseInstance.removeChannel(channel);
    }
  };
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
