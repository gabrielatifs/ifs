import React from 'react';
import { User } from '@/api/entities';
import { customLoginWithRedirect } from '../utils/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { usePostHog } from '../providers/PostHogProvider';

export default function LoginPrompt({ title, description, pageName }) {
    const { trackEvent } = usePostHog();

    const handleLogin = () => {
        trackEvent('login_prompt_clicked', {
            page: pageName,
            location: 'login_prompt_card',
        });
        const path = window.location.pathname + window.location.search + window.location.hash;
        customLoginWithRedirect(path);
    };

    return (
        <Card className="max-w-xl mx-auto my-12 border-purple-200 bg-purple-50/50">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl text-purple-900">{title}</CardTitle>
                <CardDescription className="text-purple-800 text-base mt-2">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button onClick={handleLogin} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to Continue
                </Button>
            </CardContent>
        </Card>
    );
}