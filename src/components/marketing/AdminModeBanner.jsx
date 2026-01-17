import React from 'react';
import { useUser } from '../providers/UserProvider';
import { useAdminMode } from '../providers/AdminModeProvider';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';

export default function AdminModeBanner() {
  const { user } = useUser();
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  // Only show to admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className={`sticky top-0 z-50 transition-all duration-200 ${
      isAdminMode 
        ? 'bg-blue-600 border-b border-blue-500' 
        : 'bg-gray-800 border-b border-gray-700'
    }`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-12">
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            {isAdminMode ? 'Admin Edit Mode Active' : 'Admin View'}
          </span>
          {isAdminMode && (
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
              Click on service cards to edit images
            </span>
          )}
        </div>
        <Button
          onClick={toggleAdminMode}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 h-8 px-3"
        >
          {isAdminMode ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Exit Edit Mode
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Enable Edit Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
}