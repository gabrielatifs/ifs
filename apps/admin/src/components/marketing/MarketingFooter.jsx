import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600">© {new Date().getFullYear()} Institute for Safeguarding (local)</div>
        <div className="flex items-center gap-4 text-sm">
          <Link className="text-slate-600 hover:text-slate-900" to={createPageUrl('PrivacyPolicy')}>
            Privacy
          </Link>
          <Link className="text-slate-600 hover:text-slate-900" to={createPageUrl('TermsAndConditions')}>
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}




