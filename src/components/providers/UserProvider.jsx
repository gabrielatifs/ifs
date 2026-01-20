import React, { createContext, useContext, useState, useEffect } from 'react';
import { ifs } from '@/api/ifsClient';

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

  const fetchUser = async () => {
    console.log('[UserProvider] fetchUser called');
    try {
      const currentUser = await ifs.auth.me();
      console.log('[UserProvider] User fetched:', currentUser?.email);
      setUser(currentUser);
    } catch (error) {
      console.log('[UserProvider] No user or error:', error.message);
      setUser(null);
    } finally {
      console.log('[UserProvider] Initial check complete');
      setLoading(false);
      setInitialCheckComplete(true);
    }
  };

  useEffect(() => {
    console.log('[UserProvider] Initial mount');
    fetchUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  const updateUserProfile = async (data) => {
    try {
      await ifs.auth.updateMe(data);
      // Refresh user data after update
      await fetchUser();
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