import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Settings, Edit3 } from 'lucide-react';
import { useAdminMode } from '@ifs/shared/components/providers/AdminModeProvider';
import { useUser } from '@ifs/shared/components/providers/UserProvider';

export default function AdminModeToggle() {
  // Removed per user request to hide the button.
  return null;
}