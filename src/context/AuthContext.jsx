import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userMetadata = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code === 'PGRST116') {
        const defaultProfile = {
          id: userId,
          full_name: userMetadata?.full_name || userMetadata?.name || 'Gardener',
          email: userMetadata?.email || '',
          city: userMetadata?.city || 'Bangalore',
          avatar_url: userMetadata?.avatar_url || userMetadata?.picture || ''
        };
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .upsert(defaultProfile)
          .select()
          .single();
        if (insertError) throw insertError;
        setProfile(inserted);
      } else if (error) {
        throw error;
      } else {
        if (data && (!data.email || !data.avatar_url) && userMetadata) {
          const updates = {};
          if (!data.email && userMetadata.email) updates.email = userMetadata.email;
          if (!data.avatar_url && (userMetadata.avatar_url || userMetadata.picture)) {
            updates.avatar_url = userMetadata.avatar_url || userMetadata.picture;
          }
          if (Object.keys(updates).length > 0) {
            const { data: updated } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', userId)
              .select()
              .single();
            setProfile(updated || data);
            return;
          }
        }
        setProfile(data);
      }
    } catch (err) {
      console.warn('Could not fetch/create profile:', err.message);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id, session.user.user_metadata);
      } catch (err) {
        console.warn('Auth session error:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.user_metadata);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName, city) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, city } }
    });
    if (error) throw error;

    // Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        city: city
      });
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
