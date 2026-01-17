import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { User as UserIcon } from 'lucide-react';

export default function MarketingHeader() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        console.log('[MarketingHeader] User detected:', currentUser);
        setUser(currentUser);
      } catch (e) {
        console.log('[MarketingHeader] No user logged in (this is OK for marketing pages)');
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleJoin = () => {
    window.location.href = createPageUrl('JoinUs');
  };

  const handleLogin = () => {
    console.log('[MarketingHeader] Login clicked - calling base44.auth.redirectToLogin()');
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  return (
    <div className="bg-black relative z-30">
      {/* Top Strip - Hidden on Mobile */}
      <div className="bg-black text-white/90 hidden sm:block">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10 text-xs">
          <Link to={createPageUrl("Home")} className="font-semibold text-white text-sm hidden lg:block hover:text-gray-300 transition-colors">
            Independent Federation for Safeguarding
          </Link>
          <div className="flex-1 lg:hidden"></div>
          <div className="flex items-center space-x-6">
            <Link to={createPageUrl("About")} className="hover:text-white transition-colors">About</Link>
            <Link to={createPageUrl("Governance")} className="hover:text-white transition-colors">Governance</Link>
            <Link to={createPageUrl("Contact")} className="hover:text-white transition-colors">Contact Us</Link>

            {!user && (
              <button
                  onClick={handleLogin}
                  className="flex items-center space-x-1 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign in</span>
              </button>
            )}

            {user ? (
              <Button
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-xs font-bold rounded-sm h-10"
                  asChild
              >
                <Link to={createPageUrl("Dashboard")}>Member Portal</Link>
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                size="sm"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-xs font-bold rounded-sm h-10"
              >
                Become a Member
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}