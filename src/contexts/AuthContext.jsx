import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, isBackendReady } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, skip auth initialization
    if (!isBackendReady || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Timeout fallback - never stay loading forever
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await getProfile(userId);
      if (error) {
        console.error('Error loading profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created on next login');
        }
      }
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithTelegram = async (telegramData) => {
    if (!isBackendReady || !supabase) {
      return { data: null, error: new Error('Backend not configured') };
    }

    try {
      // Telegram Login Widget returns data like:
      // { id, first_name, last_name, username, photo_url, auth_date, hash }

      // We'll use Supabase's signInAnonymously first, then link to Telegram
      // Or we can use a custom JWT approach with Supabase Edge Functions

      // For now, we'll store Telegram data in user metadata
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      // Update user metadata with Telegram info
      await supabase.auth.updateUser({
        data: {
          telegram_id: telegramData.id,
          name: `${telegramData.first_name}${telegramData.last_name ? ' ' + telegramData.last_name : ''}`,
          username: telegramData.username,
          photo_url: telegramData.photo_url,
        }
      });

      // Upsert profile (create if not exists, update if exists)
      const profileData = {
        id: data.user.id,
        telegram_id: telegramData.id,
        telegram_username: telegramData.username,
        name: `${telegramData.first_name}${telegramData.last_name ? ' ' + telegramData.last_name : ''}`,
        avatar_url: telegramData.photo_url,
      };

      await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      await loadProfile(data.user.id);
      return { data, error: null };
    } catch (error) {
      console.error('Telegram sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (!isBackendReady || !supabase) {
      setUser(null);
      setProfile(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    if (!isBackendReady || !supabase) return { error: new Error('Backend not configured') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isBackendReady,
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
