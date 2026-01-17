import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ifs/shared/components/ui/dialog';
import { Button } from '@ifs/shared/components/ui/button';

export default function OrgBulkBookingModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Organisation bulk booking</DialogTitle>
          <DialogDescription>
            This feature is not available in local no-auth/no-database mode.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




