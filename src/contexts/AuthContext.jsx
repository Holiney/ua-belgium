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

  // Generate credentials based on telegram_id
  const getTelegramCredentials = (telegramId) => {
    const email = `tg_${telegramId}@telegram.local`;
    // Use telegram_id as base for password - it's unique per user
    const password = `tg_auth_${telegramId}_secure_key`;
    return { email, password };
  };

  const signInWithTelegram = async (telegramData) => {
    if (!isBackendReady || !supabase) {
      return { data: null, error: new Error('Backend not configured') };
    }

    try {
      // Telegram Login Widget returns:
      // { id, first_name, last_name, username, photo_url, auth_date, hash }
      console.log('Signing in with Telegram data:', telegramData);

      const telegramId = String(telegramData.id);
      const { email, password } = getTelegramCredentials(telegramId);
      const fullName = `${telegramData.first_name || ''}${telegramData.last_name ? ' ' + telegramData.last_name : ''}`.trim() || 'Користувач';

      // Try to sign in first (existing user)
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If user doesn't exist, create new account
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('User not found, creating new account...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              telegram_id: telegramId,
              name: fullName,
              username: telegramData.username,
              photo_url: telegramData.photo_url,
            }
          }
        });

        if (signUpError) {
          console.error('SignUp error:', signUpError);
          throw signUpError;
        }

        signInData = signUpData;
        signInError = null;

        // Profile will be created automatically by database trigger (handle_new_user)
        // Just wait a bit for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (signInError) {
        console.error('SignIn error:', signInError);
        throw signInError;
      }

      // Update user metadata and profile for existing users
      if (signInData?.user) {
        // Update auth user metadata
        await supabase.auth.updateUser({
          data: {
            telegram_id: telegramId,
            name: fullName,
            username: telegramData.username,
            photo_url: telegramData.photo_url,
          }
        });

        // Update profile with latest Telegram data
        const profileData = {
          id: signInData.user.id,
          telegram_id: parseInt(telegramId, 10),
          telegram_username: telegramData.username || null,
          name: fullName,
          avatar_url: telegramData.photo_url || null,
        };

        await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });

        await loadProfile(signInData.user.id);
      }

      return { data: signInData, error: null };
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
