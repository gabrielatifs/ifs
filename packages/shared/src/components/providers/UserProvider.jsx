import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
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
      // Only try to fetch user profile if we have a session
      if (session) {
        const currentUser = await base44.auth.me();
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
      console.log('[UserProvider] Initial check complete');
      setLoading(false);
      setInitialCheckComplete(true);
    }
  };

  useEffect(() => {
    console.log('[UserProvider] Initial mount');
    let isMounted = true;

    const initAuth = async () => {
      // First check localStorage for a session token to see if we should expect a user
      const hasStoredSession = localStorage.getItem('sb-duewbxktgjugeknesmqn-auth-token') !== null;
      console.log('[UserProvider] Has stored session token:', hasStoredSession);

      // Use getUser() which validates the session with Supabase servers
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      console.log('[UserProvider] Initial auth user:', authUser?.email || 'none', error?.message || '');

      // If we have a stored session but getUser failed, wait a bit and retry
      // This handles race conditions where the session isn't fully restored yet
      if (hasStoredSession && !authUser && isMounted) {
        console.log('[UserProvider] Stored session exists but getUser failed, retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { user: retryUser } } = await supabase.auth.getUser();
        console.log('[UserProvider] Retry result:', retryUser?.email || 'none');
        if (isMounted) {
          const session = retryUser ? { user: retryUser } : null;
          await fetchUser(session);
        }
        return;
      }

      if (isMounted) {
        // Create a session-like object for fetchUser
        const session = authUser ? { user: authUser } : null;
        await fetchUser(session);
      }
    };

    initAuth();

    // Listen for auth state changes after initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[UserProvider] Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_OUT' && typeof window !== 'undefined') {
        const mainSiteUrl = import.meta.env.VITE_MAIN_SITE_URL || '/';
        sessionStorage.setItem('logoutRedirectAt', String(Date.now()));
        sessionStorage.setItem('logoutRedirectUrl', mainSiteUrl);
        console.log('[UserProvider] Signed out, redirecting to main site:', mainSiteUrl);
        window.location.replace(mainSiteUrl);
        return;
      }
      // Only refetch on actual auth changes, not initial session
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
      await base44.auth.updateMe(data);
      // Refresh user data after update
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUser(session);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
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
