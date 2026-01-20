import React, { createContext, useContext, useState, useEffect } from 'react';
import { ifs } from '@ifs/shared/api/ifsClient';
import { supabase } from '@ifs/shared/lib/supabase';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const fetchUser = async (session) => {
    console.log('[UserProvider] fetchUser called, session:', session?.user?.email || 'none');
    try {
      if (session) {
        const currentUser = await ifs.auth.me();
        console.log('[UserProvider] User fetched:', currentUser?.email);
        setUser(currentUser);
      } else {
        console.log('[UserProvider] No session, setting user to null');
        setUser(null);
      }
    } catch (error) {
      console.log('[UserProvider] Error fetching user:', error.message);
      setUser(null);
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (isMounted) {
        const session = authUser ? { user: authUser } : null;
        await fetchUser(session);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't do anything on sign out - fastLogout handles the redirect
      if (event === 'SIGNED_OUT') {
        return;
      }
      if (event !== 'INITIAL_SESSION' && isMounted) {
        fetchUser(session);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    await fetchUser(session);
  };

  const updateUserProfile = async (data) => {
    try {
      await ifs.auth.updateMe(data);
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUser(session);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  const contextValue = React.useMemo(() => ({
    user,
    loading,
    initialCheckComplete,
    refreshUser,
    updateUserProfile
  }), [user, loading, initialCheckComplete]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
