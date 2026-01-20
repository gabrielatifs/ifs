import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ifs/shared/components/ui/dialog';
import EditJob from './EditJob';

export default function EditJobModalRoute() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const jobId = new URLSearchParams(location.search).get('id');

    useEffect(() => {
        if (!open) {
            navigate('/admindashboard?tab=jobs', { replace: true });
        }
    }, [open, navigate]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden p-6">
                <DialogHeader>
                    <DialogTitle>{jobId ? 'Edit Job Posting' : 'Add Job Posting'}</DialogTitle>
                    <DialogDescription>
                        Update the job details and save to publish to the jobs board.
                    </DialogDescription>
                </DialogHeader>
                <EditJob
                    embedded
                    jobId={jobId}
                    onCancel={() => setOpen(false)}
                    onSaved={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
