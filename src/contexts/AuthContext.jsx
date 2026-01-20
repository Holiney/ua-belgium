import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, isBackendReady } from '../lib/supabase';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const AuthContext = createContext({});

// Keys for localStorage
const PROFILE_CACHE_KEY = 'cached-user-profile';
const USER_CACHE_KEY = 'cached-user';

export function AuthProvider({ children }) {
  // Initialize from cache for instant display
  const [user, setUser] = useState(() => loadFromStorage(USER_CACHE_KEY, null));
  const [profile, setProfile] = useState(() => loadFromStorage(PROFILE_CACHE_KEY, null));
  // Don't block render - start with false if we have cached data
  const cachedUser = loadFromStorage(USER_CACHE_KEY, null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isBackendReady || !supabase) {
      return;
    }

    // Background sync with Supabase - don't block UI
    const syncAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Load profile in background
          loadProfile(session.user.id);
        } else if (cachedUser) {
          // Session expired but we have cache - clear it
          setUser(null);
          setProfile(null);
          saveToStorage(USER_CACHE_KEY, null);
          saveToStorage(PROFILE_CACHE_KEY, null);
        }
      } catch (err) {
        console.error('Error getting session:', err);
      }
    };

    // Start sync immediately (async, doesn't block)
    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          saveToStorage(USER_CACHE_KEY, null);
          saveToStorage(PROFILE_CACHE_KEY, null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await getProfile(userId);
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }
      if (data) {
        setProfile(data);
        // Cache profile for persistence across page reloads
        saveToStorage(PROFILE_CACHE_KEY, data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      // Keep cached profile if loading fails
    }
  };

  // Cache user when it changes
  useEffect(() => {
    if (user) {
      // Cache minimal user data (id, email, phone)
      const userCache = {
        id: user.id,
        email: user.email,
        phone: user.phone,
      };
      saveToStorage(USER_CACHE_KEY, userCache);
    }
  }, [user]);

  // Send OTP to phone number
  const sendOtp = async (phone) => {
    if (!isBackendReady || !supabase) {
      return { error: new Error('Backend not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      return { data, error };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { error };
    }
  };

  // Verify OTP code
  const verifyOtp = async (phone, token) => {
    if (!isBackendReady || !supabase) {
      return { error: new Error('Backend not configured') };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) return { error };

      // Create profile only if it doesn't exist (don't overwrite existing data)
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Generate unique username: user + random number
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          const defaultUsername = `user${randomNum}`;

          await supabase.from('profiles').insert({
            id: data.user.id,
            phone: phone,
            name: defaultUsername,
            needs_username_change: true,
          });
        }

        await loadProfile(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { error };
    }
  };

  // Legacy Telegram auth (keeping for compatibility)
  const signInWithTelegram = async (telegramData) => {
    if (!isBackendReady || !supabase) {
      return { data: null, error: new Error('Backend not configured') };
    }

    try {
      console.log('Signing in with Telegram data:', telegramData);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ telegramData }),
      });

      const result = await response.json();
      console.log('Edge function result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password,
      });

      if (signInError) {
        console.error('SignIn error:', signInError);
        throw signInError;
      }

      if (signInData?.user) {
        await loadProfile(signInData.user.id);
      }

      return { data: signInData, error: null };
    } catch (error) {
      console.error('Telegram sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut called');
    console.log('[AuthContext] isBackendReady:', isBackendReady);
    console.log('[AuthContext] supabase:', !!supabase);

    // Clear cache immediately
    const clearLocalState = () => {
      setUser(null);
      setProfile(null);
      saveToStorage(USER_CACHE_KEY, null);
      saveToStorage(PROFILE_CACHE_KEY, null);
    };

    if (!isBackendReady || !supabase) {
      console.log('[AuthContext] No backend, clearing state locally');
      clearLocalState();
      return { error: null };
    }

    try {
      console.log('[AuthContext] Calling supabase.auth.signOut...');
      const { error } = await supabase.auth.signOut();
      console.log('[AuthContext] signOut result:', { error });

      // Always clear state regardless of error
      clearLocalState();

      return { error };
    } catch (err) {
      console.error('[AuthContext] signOut exception:', err);
      clearLocalState();
      return { error: err };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    if (!isBackendReady || !supabase) return { error: new Error('Backend not configured') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        // Update cache
        saveToStorage(PROFILE_CACHE_KEY, data);
      }
      return { data, error };
    } catch (err) {
      console.error('Update profile error:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isBackendReady,
    sendOtp,
    verifyOtp,
    signInWithTelegram,
    signOut,
    updateProfile,
    refreshProfile: () => user && loadProfile(user.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
