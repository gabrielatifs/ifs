import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Edit3 } from 'lucide-react';
import { useAdminMode } from '../providers/AdminModeProvider';
import { useUser } from '../providers/UserProvider';

export default function AdminModeToggle() {
  // Removed per user request to hide the button.
  return null;
}