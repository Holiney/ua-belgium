import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, isBackendReady } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBackendReady || !supabase) {
      setLoading(false);
      return;
    }

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

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

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
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
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
          await supabase.from('profiles').insert({
            id: data.user.id,
            phone: phone,
            name: 'Користувач',
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

    try {
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
