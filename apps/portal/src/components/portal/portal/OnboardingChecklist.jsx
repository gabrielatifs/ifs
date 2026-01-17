
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Progress } from '@ifs/shared/components/ui/progress';
import { CheckCircle2, Circle, X, Building2, Users, Linkedin, Calendar, Gift, ExternalLink, Sparkles, Award } from 'lucide-react';
import { EventSignup } from '@ifs/shared/api/entities';
import { Organisation } from '@ifs/shared/api/entities';
import { base44 } from '@ifs/shared/api/base44Client';

const ChecklistItem = ({ icon: Icon, title, description, completed, actionText, actionLink, isExternal, onClick }) => (
    <div className={`group relative flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
        completed 
            ? 'bg-green-50/50 border border-green-200/50' 
            : 'bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm'
    }`}>
        <div className="flex-shrink-0 mt-0.5">
            {completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
                <Circle className="w-5 h-5 text-slate-300 group-hover:text-purple-400 transition-colors" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{description}</p>
            {!completed && (
                isExternal ? (
                    <a 
                        href={actionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        {actionText}
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                ) : onClick ? (
                    <button 
                        onClick={onClick}
                        className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        {actionText}
                    </button>
                ) : (
                    <Link 
                        to={actionLink}
                        className="inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        {actionText}
                    </Link>
                )
            )}
        </div>
    </div>
);

export default function OnboardingChecklist({ user, onDismiss }) {
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkProgress = async () => {
            if (!user) return;

            const completedItems = user.onboardingChecklistCompleted || [];
            const items = [];

            // 1. Create Organisation
            const hasOrg = user.organisationId ? true : false;
            items.push({
                id: 'create_org',
                icon: Building2,
                title: 'Create Your Organisation',
                description: 'Set up your organisation profile and invite your team.',
                completed: completedItems.includes('create_org') || hasOrg,
                actionText: 'Create Organisation',
                actionLink: createPageUrl('ManageOrganisation')
            });

            // 2. Invite Team (only if org exists)
            if (hasOrg) {
                try {
                    const org = await Organisation.get(user.organisationId);
                    const hasInvited = org && org.memberCount && org.memberCount > 1;
                    items.push({
                        id: 'invite_team',
                        icon: Users,
                        title: 'Invite Your Team',
                        description: 'Invite colleagues to join your organisation on the platform.',
                        completed: completedItems.includes('invite_team') || hasInvited,
                        actionText: 'Invite Team Members',
                        actionLink: createPageUrl('ManageOrganisation')
                    });
                } catch (error) {
                    console.error('Failed to check team invites:', error);
                }
            }

            // 3. Add Membership Credential to LinkedIn
            items.push({
                id: 'add_credential_linkedin',
                icon: Award,
                title: 'Add Your Credential to LinkedIn',
                description: 'Showcase your professional membership on your LinkedIn profile.',
                completed: completedItems.includes('add_credential_linkedin'),
                actionText: 'View My Credentials',
                actionLink: createPageUrl('MyCertificates'),
                onClick: async () => {
                    try {
                        await base44.auth.updateMe({
                            onboardingChecklistCompleted: [...(user.onboardingChecklistCompleted || []), 'add_credential_linkedin']
                        });
                        // The action link navigates internally, so we don't open a new window here.
                        // The completion is tracked by the onClick, and navigation happens via Link/actionLink.
                    } catch (error) {
                        console.error('Failed to update checklist:', error);
                    }
                }
            });

            // 4. Follow on LinkedIn
            items.push({
                id: 'follow_linkedin',
                icon: Linkedin,
                title: 'Follow Us On LinkedIn',
                description: 'Stay updated with the latest safeguarding news and resources.',
                completed: completedItems.includes('follow_linkedin'),
                actionText: 'Follow on LinkedIn',
                actionLink: 'https://www.linkedin.com/company/institute-for-safeguarding',
                isExternal: true,
                onClick: async () => {
                    try {
                        await base44.auth.updateMe({
                            onboardingChecklistCompleted: [...(user.onboardingChecklistCompleted || []), 'follow_linkedin']
                        });
                        window.open('https://www.linkedin.com/company/institute-for-safeguarding', '_blank');
                    } catch (error) {
                        console.error('Failed to update checklist:', error);
                    }
                }
            });

            // 5. Join a Masterclass
            try {
                const signups = await EventSignup.filter({ userId: user.id });
                const hasMasterclass = signups && signups.length > 0;
                items.push({
                    id: 'join_masterclass',
                    icon: Calendar,
                    title: 'Join a Masterclass',
                    description: 'Register for an expert-led session to boost your skills.',
                    completed: completedItems.includes('join_masterclass') || hasMasterclass,
                    actionText: 'Browse Masterclasses',
                    actionLink: createPageUrl('MemberMasterclasses')
                });
            } catch (error) {
                console.error('Failed to check masterclass signups:', error);
            }

            setChecklist(items);
            setLoading(false);
        };

        checkProgress();
    }, [user]);

    const handleDismiss = async () => {
        try {
            await base44.auth.updateMe({
                onboardingChecklistDismissed: true
            });
            if (onDismiss) onDismiss();
        } catch (error) {
            console.error('Failed to dismiss checklist:', error);
        }
    };

    if (loading) {
        return null;
    }

    const completedCount = checklist.filter(item => item.completed).length;
    const totalCount = checklist.length;
    const progress = (completedCount / totalCount) * 100;
    const allCompleted = completedCount === totalCount;

    return (
        <Card className="overflow-hidden border-2 border-purple-200/60 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 shadow-lg">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold mb-0.5">Welcome to IfS!</CardTitle>
                            <p className="text-sm text-purple-100">
                                Complete these steps to unlock your welcome reward
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold">{completedCount} of {totalCount} completed</span>
                        <span className="text-purple-200">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/30" />
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
                {checklist.map((item) => (
                    <ChecklistItem key={item.id} {...item} />
                ))}

                {allCompleted && !user.onboardingRewardClaimed && (
                    <div className="mt-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2.5 bg-green-100 rounded-lg">
                                <Gift className="w-6 h-6 text-green-700" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-green-900 mb-2">🎊 You've Earned Your Welcome Reward!</h3>
                                <p className="text-sm text-green-800 mb-4 font-medium">
                                    Congratulations on completing all the steps! You can now claim ONE of these exclusive rewards:
                                </p>
                                <div className="bg-white/90 p-4 rounded-lg border-2 border-green-300 mb-4">
                                    <p className="text-sm font-bold text-green-900 mb-3 uppercase tracking-wide">
                                        Choose Your Reward:
                                    </p>
                                    <ul className="space-y-2.5">
                                        <li className="flex items-start gap-2">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                                <span className="text-green-700 font-bold text-sm">1</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-green-900">Free 40-Minute Consultation</p>
                                                <p className="text-xs text-green-700">One-on-one expert guidance on your safeguarding challenges</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                                <span className="text-green-700 font-bold text-sm">2</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-green-900">15% Off Any Training Package</p>
                                                <p className="text-xs text-green-700">Discount on any CPD training course in our catalogue</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                                <span className="text-green-700 font-bold text-sm">3</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-green-900">15% Off Supervision Services</p>
                                                <p className="text-xs text-green-700">Professional supervision to support your safeguarding practice</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                                    <a href="mailto:info@ifs-safeguarding.co.uk?subject=Onboarding Reward Claim - I Choose...&body=Hi IfS Team,%0D%0A%0D%0AI've completed all the onboarding steps and would like to claim my reward.%0D%0A%0D%0AI choose: [Please specify: Free Consultation / 15% Off Training / 15% Off Supervision]%0D%0A%0D%0AThank you!">
                                        Email Us to Claim Your Reward
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
