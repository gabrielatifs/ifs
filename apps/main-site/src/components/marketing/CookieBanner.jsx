import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';

const COOKIE_CONSENT_KEY = 'ifs_cookie_consent';

export const getCookieConsent = () => {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent ? JSON.parse(consent) : null;
};

export const setCookieConsent = (consent) => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
};

export default function CookieBanner({ onConsentChange }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === null) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    const consent = {
      necessary: true,
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString()
    };
    setCookieConsent(consent);
    setIsVisible(false);
    if (onConsentChange) onConsentChange(consent);
  };

  const handleReject = () => {
    const consent = {
      necessary: true,
      analytics: false,
      functional: false,
      timestamp: new Date().toISOString()
    };
    setCookieConsent(consent);
    setIsVisible(false);
    if (onConsentChange) onConsentChange(consent);
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 lg:left-auto lg:max-w-md z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 animate-in slide-in-from-bottom-5 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">We value your privacy</h3>
                <p className="text-xs text-gray-600 mt-1">This website uses cookies</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              We use essential cookies to make our website work, and optional cookies to enhance your experience. 
              Essential cookies are always enabled. Optional cookies help us understand how you use our site and 
              improve your experience.
            </p>

            {showDetails && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 w-4 h-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Necessary Cookies</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Required for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Functional & Analytics Cookies</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Help us understand how visitors use our website and improve the user experience. 
                      Includes analytics (PostHog), payment processing (Stripe), and marketing tools (Apollo.io).
                    </p>
                  </div>
                </div>

                <Link 
                  to={createPageUrl('CookiePolicy')} 
                  className="text-xs text-purple-600 hover:text-purple-700 underline inline-block mt-2"
                  target="_blank"
                >
                  View our full Cookie Policy
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAccept}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              size="sm"
            >
              Accept All Cookies
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
                size="sm"
              >
                Reject Optional
              </Button>
              <Button
                onClick={handleCustomize}
                variant="ghost"
                className="flex-1 text-gray-700 hover:text-gray-900"
                size="sm"
              >
                {showDetails ? 'Hide' : 'Customize'}
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 justify-center">
            <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-purple-600 underline" target="_blank">
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link to={createPageUrl('TermsAndConditions')} className="hover:text-purple-600 underline" target="_blank">
              Terms & Conditions
            </Link>
            <span className="text-gray-400">•</span>
            <Link to={createPageUrl('CookiePolicy')} className="hover:text-purple-600 underline" target="_blank">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}