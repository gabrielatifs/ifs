import React, { createContext, useContext, useMemo } from 'react';

// PostHog removed: keep a no-op provider to avoid touching all call sites.
const PostHogContext = createContext({
  trackEvent: () => {},
  trackPage: () => {},
  isFeatureEnabled: () => false,
  isReady: false,
  hasConsent: false,
  handleConsentChange: () => {},
});

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHog must be used within PostHogProvider');
  }
  return context;
};

export const PostHogProvider = ({ children }) => {
  const contextValue = useMemo(() => ({
    trackEvent: () => {},
    trackPage: () => {},
    isFeatureEnabled: () => false,
    isReady: false,
    hasConsent: false,
    handleConsentChange: () => {},
  }), []);

  return (
    <PostHogContext.Provider value={contextValue}>
      {children}
    </PostHogContext.Provider>
  );
};
