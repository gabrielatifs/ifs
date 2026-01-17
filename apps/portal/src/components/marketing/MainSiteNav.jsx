import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@ifs/shared/components/ui/button';
import { createPageUrl } from '@ifs/shared/utils';

/**
 * Lightweight marketing nav used on a handful of portal-bundled marketing pages.
 * In local/no-auth mode we avoid any auth checks/redirects here.
 */
export default function MainSiteNav({ onLogin }) {
  return (
    <div className="relative z-20 bg-[#5e028f]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={createPageUrl('Home')} className="text-white font-bold text-2xl">
          IfS
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" className="bg-white text-[#5e028f] hover:bg-white/90">
            <Link to={createPageUrl('Membership')}>Membership</Link>
          </Button>
          <Button
            onClick={onLogin}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#5e028f]"
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}




