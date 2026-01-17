import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { initPostHog } from '@ifs/shared/api/functions';
import { useUser } from './UserProvider';

// Cookie consent helper (fallback if not provided)
const getCookieConsent = () => {
  if (typeof window !== 'undefined' && window.getCookieConsent) {
    return window.getCookieConsent();
  }
  return true; // Default to true if not set
};

const PostHogContext = createContext();

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHog must be used within PostHogProvider');
  }
  return context;
};

export const PostHogProvider = ({ children }) => {
  const [isPostHogReady, setIsPostHogReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { user, loading: userLoading } = useUser();
  const posthogInitialized = useRef(false);
  const setupAttempted = useRef(false);

  useEffect(() => {
    if (userLoading || setupAttempted.current) {
      return;
    }

    setupAttempted.current = true;

    const setupPostHog = async () => {
      try {
        const response = await initPostHog();
        const config = response.data || response;
        
        if (!config.api_key) {
          console.warn('PostHog: No API key provided, analytics disabled.');
          setLoadFailed(true);
          return;
        }
        
        if (!window.posthog) {
          try {
            await loadPostHogScript();
          } catch (scriptError) {
            console.warn('PostHog: Script loading failed (likely blocked by ad blocker or privacy settings), analytics disabled.');
            setLoadFailed(true);
            return;
          }
        }
        
        // Check cookie consent
        const consent = getCookieConsent();
        const analyticsConsent = consent?.analytics ?? false;
        setHasConsent(analyticsConsent);
        
        if (window.posthog && !posthogInitialized.current) {
          window.posthog.init(config.api_key, {
            api_host: config.host,
            // Start with anonymous mode if no consent
            person_profiles: analyticsConsent ? 'identified_only' : 'never',
            capture_pageview: analyticsConsent,
            capture_pageleave: analyticsConsent,
            autocapture: analyticsConsent,
            disable_session_recording: !analyticsConsent,
            debug: false,
            loaded: () => {
              posthogInitialized.current = true;
              setIsPostHogReady(true);
              
              if (analyticsConsent) {
                identifyUserAndGroup();
              } else {
                // Reset to anonymous mode
                if (window.posthog) {
                  window.posthog.reset();
                }
              }
            }
          });
        } else if (window.posthog && posthogInitialized.current) {
          // Update consent settings if already initialized
          if (analyticsConsent) {
            identifyUserAndGroup();
          } else {
            window.posthog.reset();
          }
        }
        
      } catch (error) {
        console.warn('PostHog: Setup failed, analytics disabled.', error.message);
        setLoadFailed(true);
      }
    };
    
    const identifyUserAndGroup = () => {
      if (!window.posthog || !posthogInitialized.current || !hasConsent) return;
        
      if (user) {
        const userProperties = {
          email: user.email,
          name: user.displayName || user.full_name,
          membershipType: user.membershipType,
          membershipStatus: user.membershipStatus,
          role: user.role,
          organisation: user.organisationName,
          sector: user.sector
        };
        window.posthog.identify(user.id, userProperties);

        if (user.organisationName) {
          window.posthog.group('organisation', user.organisationName, {
            organisation_name: user.organisationName,
            sector: user.sector
          });
        }
      } else {
        window.posthog.reset();
      }
    };

    const loadPostHogScript = () => {
      return new Promise((resolve, reject) => {
        if (window.posthog) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://app.posthog.com/static/array.js';
        script.async = true;
        
        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error('PostHog script loading timeout'));
        }, 10000); // 10 second timeout
        
        script.onload = () => {
          clearTimeout(timeout);
          if (!window.posthog) { window.posthog = []; }
          const mainScript = document.createElement('script');
          mainScript.src = 'https://app.posthog.com/static/recorder.js';
          mainScript.async = true;
          
          const mainTimeout = setTimeout(() => {
            reject(new Error('PostHog main script loading timeout'));
          }, 10000);
          
          mainScript.onload = () => {
            clearTimeout(mainTimeout);
            resolve();
          };
          mainScript.onerror = () => {
            clearTimeout(mainTimeout);
            reject(new Error('Failed to load PostHog recorder script'));
          };
          document.head.appendChild(mainScript);
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load PostHog array script'));
        };
        
        document.head.appendChild(script);
      });
    };

    setupPostHog();
  }, [user, userLoading, hasConsent]);

  // Handle consent changes
  const handleConsentChange = React.useCallback((consent) => {
    const analyticsConsent = consent?.analytics ?? false;
    setHasConsent(analyticsConsent);

    if (window.posthog && posthogInitialized.current) {
      try {
        if (analyticsConsent) {
          // Enable full tracking
          window.posthog.set_config({
            person_profiles: 'identified_only',
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: true,
            disable_session_recording: false
          });
          
          // Identify user if logged in
          if (user) {
            const userProperties = {
              email: user.email,
              name: user.displayName || user.full_name,
              membershipType: user.membershipType,
              membershipStatus: user.membershipStatus,
              role: user.role,
              organisation: user.organisationName,
              sector: user.sector
            };
            window.posthog.identify(user.id, userProperties);

            if (user.organisationName) {
              window.posthog.group('organisation', user.organisationName, {
                organisation_name: user.organisationName,
                sector: user.sector
              });
            }
          }
          
          // Capture consent acceptance event
          window.posthog.capture('cookie_consent_granted', {
            consent_type: 'analytics',
            timestamp: new Date().toISOString()
          });
        } else {
          // Capture consent rejection before disabling
          if (window.posthog.capture) {
            window.posthog.capture('cookie_consent_rejected', {
              consent_type: 'analytics',
              timestamp: new Date().toISOString()
            });
          }
          
          // Disable tracking and reset
          window.posthog.set_config({
            person_profiles: 'never',
            capture_pageview: false,
            capture_pageleave: false,
            autocapture: false,
            disable_session_recording: true
          });
          window.posthog.reset();
        }
      } catch (error) {
        console.warn('PostHog: Failed to update consent settings', error.message);
      }
    }
  }, [user]);

  const trackEvent = React.useCallback((eventName, properties = {}) => {
    if (loadFailed) return; // Silently fail if PostHog didn't load
    
    try {
      if (window.posthog && isPostHogReady && hasConsent) {
        window.posthog.capture(eventName, properties);
      }
    } catch (error) {
      console.warn('PostHog: Failed to track event', error.message);
    }
  }, [isPostHogReady, hasConsent, loadFailed]);

  const trackPage = React.useCallback((pageName, properties = {}) => {
    if (loadFailed) return; // Silently fail if PostHog didn't load
    
    try {
      if (window.posthog && isPostHogReady && hasConsent) {
        window.posthog.capture('$pageview', {
          $current_url: window.location.href,
          page_name: pageName,
          ...properties
        });
      }
    } catch (error) {
      console.warn('PostHog: Failed to track page', error.message);
    }
  }, [isPostHogReady, hasConsent, loadFailed]);

  const isFeatureEnabled = React.useCallback((flagKey) => {
    if (loadFailed) return false; // Return false if PostHog didn't load
    
    try {
      if (window.posthog && isPostHogReady && hasConsent) {
        return window.posthog.isFeatureEnabled(flagKey);
      }
    } catch (error) {
      console.warn('PostHog: Failed to check feature flag', error.message);
    }
    return false;
  }, [isPostHogReady, hasConsent, loadFailed]);

  const contextValue = React.useMemo(() => ({
    trackEvent,
    trackPage,
    isFeatureEnabled,
    isReady: isPostHogReady,
    hasConsent,
    handleConsentChange
  }), [trackEvent, trackPage, isFeatureEnabled, isPostHogReady, hasConsent, handleConsentChange]);

  return (
    <PostHogContext.Provider value={contextValue}>
      {children}
    </PostHogContext.Provider>
  );
};