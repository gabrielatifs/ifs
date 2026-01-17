import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Shield, Cookie } from 'lucide-react';

// Import the full policy content components
import TermsContent from './TermsContent';
import PrivacyContent from './PrivacyContent';
import CookieContent from './CookieContent';

const policyData = {
    terms: {
        title: 'Terms and Conditions',
        icon: FileText,
        Component: TermsContent
    },
    privacy: {
        title: 'Privacy Policy',
        icon: Shield,
        Component: PrivacyContent
    },
    cookie: {
        title: 'Cookie Policy',
        icon: Cookie,
        Component: CookieContent
    }
};

export default function PolicyModal({ open, onOpenChange, policyType }) {
    if (!policyType || !policyData[policyType]) return null;

    const { title, icon: Icon, Component } = policyData[policyType];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <Component />
                </div>
            </DialogContent>
        </Dialog>
    );
}