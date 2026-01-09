import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, isBackendReady } from '../lib/supabase';

const AuthContext = createContext({});

// Storage key for linking telegram_id to anonymous session
const TELEGRAM_SESSION_KEY = 'ua_belgium_telegram_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // Timeout fallback
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
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
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created');
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
      console.log('Signing in with Telegram data:', telegramData);

      const telegramId = String(telegramData.id);
      const fullName = `${telegramData.first_name || ''}${telegramData.last_name ? ' ' + telegramData.last_name : ''}`.trim() || 'Користувач';

      // Check if we have an existing session for this telegram_id
      const savedSession = localStorage.getItem(TELEGRAM_SESSION_KEY);
      let existingTelegramId = null;

      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          existingTelegramId = parsed.telegram_id;
        } catch (e) {
          localStorage.removeItem(TELEGRAM_SESSION_KEY);
        }
      }

      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      // If we have a session and it matches the telegram_id, just update profile
      if (currentSession?.user && existingTelegramId === telegramId) {
        console.log('Using existing session for telegram_id:', telegramId);

        // Update profile with latest data
        await updateProfileData(currentSession.user.id, telegramId, telegramData, fullName);
        await loadProfile(currentSession.user.id);

        return { data: { user: currentSession.user, session: currentSession }, error: null };
      }

      // Sign out if different user
      if (currentSession && existingTelegramId && existingTelegramId !== telegramId) {
        console.log('Different telegram user, signing out previous session');
        await supabase.auth.signOut();
      }

      // Create new anonymous session
      console.log('Creating new anonymous session...');
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Anonymous sign in error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from signInAnonymously');
      }

      // Save telegram_id to localStorage
      localStorage.setItem(TELEGRAM_SESSION_KEY, JSON.stringify({
        telegram_id: telegramId,
        user_id: data.user.id
      }));

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          telegram_id: telegramId,
          name: fullName,
          username: telegramData.username,
          photo_url: telegramData.photo_url,
        }
      });

      // Create/update profile
      await updateProfileData(data.user.id, telegramId, telegramData, fullName);
      await loadProfile(data.user.id);

      return { data, error: null };
    } catch (error) {
      console.error('Telegram sign in error:', error);
      return { data: null, error };
    }
  };

  const updateProfileData = async (userId, telegramId, telegramData, fullName) => {
    const profileData = {
      id: userId,
      telegram_id: parseInt(telegramId, 10),
      telegram_username: telegramData.username || null,
      name: fullName,
      avatar_url: telegramData.photo_url || null,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (error) {
      console.error('Profile update error:', error);
    }
  };

  const signOut = async () => {
    // Clear telegram session
    localStorage.removeItem(TELEGRAM_SESSION_KEY);

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
