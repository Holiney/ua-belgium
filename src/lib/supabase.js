const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendReady = !!(supabaseUrl && supabaseAnonKey);

// Supabase instance - initialized eagerly but non-blocking
let _supabaseInstance = null;
let _initPromise = null;
let _isReady = false;

// Initialize Supabase EAGERLY (but still async to not block render)
const initSupabase = () => {
  if (_supabaseInstance) return Promise.resolve(_supabaseInstance);
  if (_initPromise) return _initPromise;

  _initPromise = import('@supabase/supabase-js').then(({ createClient }) => {
    _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    });
    _isReady = true;
    return _supabaseInstance;
  });

  return _initPromise;
};

// Start loading IMMEDIATELY (not in setTimeout)
if (isBackendReady) {
  initSupabase();
}

// Wait for Supabase to be ready
export const waitForSupabase = () => _initPromise || Promise.resolve(null);

// Check if ready synchronously
export const isSupabaseReady = () => _isReady;

// Get instance (may be null if not ready)
export const getSupabase = () => _supabaseInstance;

// Backwards compatible proxy
export const supabase = isBackendReady ? new Proxy({}, {
  get(_, prop) {
    if (!_supabaseInstance) {
      // Return chainable dummy that resolves to empty data
      if (prop === 'from') {
        return () => createChainableDummy();
      }
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null } }),
          getUser: async () => ({ data: { user: null } }),
          onAuthStateChange: (cb) => {
            // When ready, set up real listener
            _initPromise?.then(() => {
              _supabaseInstance?.auth.onAuthStateChange(cb);
            });
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
          signOut: async () => ({ error: null }),
          signInWithOtp: async () => ({ error: new Error('Loading...') }),
          verifyOtp: async () => ({ error: new Error('Loading...') }),
          signInWithPassword: async () => ({ error: new Error('Loading...') }),
        };
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ error: new Error('Loading...') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          })
        };
      }
      return undefined;
    }
    return _supabaseInstance[prop];
  }
}) : null;

// Create a chainable dummy that returns empty data when awaited
function createChainableDummy() {
  const dummy = {
    select: () => dummy,
    insert: () => dummy,
    update: () => dummy,
    delete: () => dummy,
    eq: () => dummy,
    neq: () => dummy,
    gt: () => dummy,
    lt: () => dummy,
    gte: () => dummy,
    lte: () => dummy,
    like: () => dummy,
    ilike: () => dummy,
    is: () => dummy,
    in: () => dummy,
    order: () => dummy,
    limit: () => dummy,
    range: () => dummy,
    single: () => dummy,
    maybeSingle: () => dummy,
    // When awaited, return empty result
    then: (resolve) => resolve({ data: [], error: null, count: 0 }),
  };
  return dummy;
}

// Auth helpers
export const getCurrentUser = async () => {
  await waitForSupabase();
  if (!_supabaseInstance) return null;
  const { data: { user } } = await _supabaseInstance.auth.getUser();
  return user;
};

export const signOut = async () => {
  await waitForSupabase();
  if (!_supabaseInstance) return { error: null };
  const { error } = await _supabaseInstance.auth.signOut();
  return { error };
};

// Database helpers - WAIT for Supabase to be ready
export const getListings = async (table, filters = {}) => {
  if (!isBackendReady) {
    return { data: [], error: null };
  }

  // Wait for SDK to initialize
  await waitForSupabase();
  if (!_supabaseInstance) {
    return { data: [], error: null };
  }

  try {
    let query = _supabaseInstance
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

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
    return { data: data || [], error };
  } catch (err) {
    console.error(`getListings(${table}) error:`, err);
    return { data: [], error: err };
  }
};

// Paginated fetch - WAIT for Supabase
export const getListingsPaginated = async (table, { page = 0, pageSize = 20, filters = {} } = {}) => {
  if (!isBackendReady) {
    return { data: [], error: null, hasMore: false, total: 0 };
  }

  // Wait for SDK
  await waitForSupabase();
  if (!_supabaseInstance) {
    return { data: [], error: null, hasMore: false, total: 0 };
  }

  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = _supabaseInstance
      .from(table)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

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
      return { data: [], error, hasMore: false, total: 0 };
    }

    const total = count || 0;
    const hasMore = (page + 1) * pageSize < total;

    return { data: data || [], error: null, hasMore, total };
  } catch (err) {
    console.error(`getListingsPaginated error:`, err);
    return { data: [], error: err, hasMore: false, total: 0 };
  }
};

// Realtime subscription
export const subscribeToListings = (table, callback) => {
  if (!_supabaseInstance) {
    // Wait and subscribe when ready
    _initPromise?.then(() => {
      if (_supabaseInstance) {
        const channel = _supabaseInstance
          .channel(`${table}-changes`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
          .subscribe();
        // Store for cleanup
        callback._channel = channel;
      }
    });
    return {
      unsubscribe: () => {
        if (callback._channel && _supabaseInstance) {
          _supabaseInstance.removeChannel(callback._channel);
        }
      }
    };
  }

  const channel = _supabaseInstance
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();

  return {
    unsubscribe: () => _supabaseInstance.removeChannel(channel)
  };
};

export const createListing = async (table, listing) => {
  await waitForSupabase();
  if (!_supabaseInstance) return { data: null, error: new Error('Not ready') };

  const { data, error } = await _supabaseInstance
    .from(table)
    .insert([listing])
    .select()
    .single();
  return { data, error };
};

export const updateListing = async (table, id, updates) => {
  await waitForSupabase();
  if (!_supabaseInstance) return { data: null, error: new Error('Not ready') };

  const { data, error } = await _supabaseInstance
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteListing = async (table, id) => {
  await waitForSupabase();
  if (!_supabaseInstance) return { error: new Error('Not ready') };

  const { error } = await _supabaseInstance
    .from(table)
    .delete()
    .eq('id', id);
  return { error };
};

export const getProfile = async (userId) => {
  await waitForSupabase();
  if (!_supabaseInstance) return { data: null, error: null };

  const { data, error } = await _supabaseInstance
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  await waitForSupabase();
  if (!_supabaseInstance) return { data: null, error: new Error('Not ready') };

  const { data, error } = await _supabaseInstance
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const uploadImage = async (bucket, path, file) => {
  await waitForSupabase();
  if (!_supabaseInstance) return { error: new Error('Not ready') };

  const { data, error } = await _supabaseInstance.storage
    .from(bucket)
    .upload(path, file);

  if (error) return { error };

  const { data: { publicUrl } } = _supabaseInstance.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: publicUrl, error: null };
};
