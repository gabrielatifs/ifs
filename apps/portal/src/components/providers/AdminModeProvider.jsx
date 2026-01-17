import React, { createContext, useContext, useState } from 'react';

const AdminModeContext = createContext();

export const useAdminMode = () => {
  const context = useContext(AdminModeContext);
  if (!context) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
};

export const AdminModeProvider = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
  };

  return (
    <AdminModeContext.Provider value={{
      isAdminMode,
      setIsAdminMode,
      toggleAdminMode
    }}>
      {children}
    </AdminModeContext.Provider>
  );
};