import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Heart } from 'lucide-react';
import TrainingClaiming from './TrainingClaiming';
import SupervisionClaiming from './SupervisionClaiming';

export default function ComplimentaryServices({ user }) {
    const isActiveFullMember = user?.membershipType === 'Full' && user?.membershipStatus === 'active';

    if (!isActiveFullMember) {
        return null;
    }

    return (
        <Tabs defaultValue="training" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="training">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Training Session
                </TabsTrigger>
                <TabsTrigger value="supervision">
                    <Heart className="w-4 h-4 mr-2" />
                    Supervision Session
                </TabsTrigger>
            </TabsList>
            <TabsContent value="training">
                <TrainingClaiming user={user} />
            </TabsContent>
            <TabsContent value="supervision">
                <SupervisionClaiming user={user} />
            </TabsContent>
        </Tabs>
    );
}