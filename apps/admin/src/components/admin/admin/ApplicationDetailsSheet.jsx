import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@ifs/shared/components/ui/sheet';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Separator } from '@ifs/shared/components/ui/separator';
import { Button } from '@ifs/shared/components/ui/button';
import { FileText, Download, RefreshCw, CheckCircle2, Crown, Building2, CreditCard, Calendar, User as UserIcon, Award, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { syncToSupabase } from '@ifs/shared/api/functions';
import { useToast } from "@ifs/shared/components/ui/use-toast";

const DetailItem = ({ label, value, fullWidth = false }) => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return null;
    }
    
    return (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-2 mt-1">
                    {value.map((item, index) => (
                        <Badge key={index} variant="secondary" className="font-normal bg-slate-100 text-slate-800">
                            {item}
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-base text-slate-900 break-words">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</p>
            )}
        </div>
    );
};

const FileList = ({ label, files }) => {
    if (!files || files.length === 0) return null;
    return (
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <div className="mt-2 space-y-2">
                {files.map((fileUrl, index) => (
                    <a
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-blue-600 truncate flex-shrink min-w-0">
                                {decodeURIComponent(fileUrl.substring(fileUrl.lastIndexOf('/') + 1).split('?')[0])}
                            </span>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                    </a>
                ))}
            </div>
        </div>
    );
};

const SectionHeader = ({ icon: Icon, title, badge = null }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 flex-1">{title}</h3>
        {badge}
    </div>
);

export default function ApplicationDetailsSheet({ profile, open, onOpenChange }) {
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);

    if (!profile) return null;

    const handleTestSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncToSupabase({});
            
            if (result.data?.success) {
                toast({
                    title: "✅ Sync Successful",
                    description: `User data ${result.data.action} in Supabase successfully`,
                    variant: "default",
                    className: "bg-green-50 border-green-200"
                });
            } else {
                throw new Error(result.data?.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast({
                title: "❌ Sync Failed",
                description: error.message || "Failed to sync to Supabase. Check function logs.",
                variant: "destructive"
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const hasTrainingData =
        profile.completed_training?.length > 0 ||
        profile.uploaded_certifications?.length > 0 ||
        profile.had_induction !== null ||
        profile.training_refresh_frequency ||
        profile.attended_training_topics?.length > 0 ||
        profile.other_training_details ||
        profile.uploaded_training_evidence?.length > 0 ||
        profile.receives_supervision !== null;

    const hasStripeData = 
        profile.stripeCustomerId ||
        profile.stripeSubscriptionId ||
        profile.stripeSubscriptionStatus;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader className="pb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <SheetTitle className="text-2xl">Complete User Profile</SheetTitle>
                            <SheetDescription>
                                Viewing all data for <span className="font-semibold text-purple-600">{profile.displayName || profile.full_name}</span> ({profile.email})
                            </SheetDescription>
                        </div>
                        <Button 
                            onClick={handleTestSync}
                            disabled={isSyncing}
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0"
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Test Supabase Sync
                                </>
                            )}
                        </Button>
                    </div>
                </SheetHeader>
                
                <div className="space-y-8 pb-8">
                    {/* Account Status */}
                    <div>
                        <SectionHeader 
                            icon={CheckCircle2} 
                            title="Account Status"
                            badge={
                                <Badge variant={profile.membershipStatus === 'active' ? 'default' : 'outline'}>
                                    {profile.membershipStatus}
                                </Badge>
                            }
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="User ID" value={profile.id} fullWidth />
                            <DetailItem label="Email" value={profile.email} />
                            <DetailItem label="First Name" value={profile.firstName} />
                            <DetailItem label="Last Name" value={profile.lastName} />
                            <DetailItem label="Display Name" value={profile.displayName} />
                            <DetailItem label="Membership Type" value={profile.membershipType} />
                            <DetailItem label="Membership Status" value={profile.membershipStatus} />
                            <DetailItem label="Onboarding Completed" value={profile.onboarding_completed} />
                            <DetailItem 
                                label="Account Created" 
                                value={profile.created_date ? format(new Date(profile.created_date), 'PPpp') : null} 
                            />
                            <DetailItem 
                                label="Last Updated" 
                                value={profile.updated_date ? format(new Date(profile.updated_date), 'PPpp') : null} 
                            />
                            <DetailItem label="Role" value={profile.role} />
                            <DetailItem label="Profile Image URL" value={profile.profileImageUrl} fullWidth />
                        </div>
                    </div>

                    <Separator />

                    {/* Organisation Info */}
                    {(profile.organisationId || profile.organisationName) && (
                        <>
                            <div>
                                <SectionHeader icon={Building2} title="Organisation Details" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailItem label="Organisation ID" value={profile.organisationId} />
                                    <DetailItem label="Organisation Name" value={profile.organisationName} />
                                    <DetailItem label="Organisation Role" value={profile.organisationRole} fullWidth />
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Professional Info */}
                    <div>
                        <SectionHeader icon={UserIcon} title="Professional Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Sector" value={profile.sector} />
                            <DetailItem label="Other Sector" value={profile.other_sector} />
                            <DetailItem label="Sub-sector" value={profile.subsector} />
                            <DetailItem label="Other Sub-sector" value={profile.other_sub_sector} />
                            <DetailItem label="Safeguarding Role" value={profile.safeguarding_role} fullWidth />
                        </div>
                    </div>

                    {hasTrainingData && <Separator />}

                    {/* Training & Development */}
                    {hasTrainingData && (
                        <div>
                            <SectionHeader icon={Award} title="Training & Development" />
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailItem label="Completed Training" value={profile.completed_training} fullWidth />
                                    <DetailItem label="Had Induction" value={profile.had_induction} />
                                    <DetailItem label="Training Refresh Frequency" value={profile.training_refresh_frequency} />
                                    <DetailItem label="Receives Supervision" value={profile.receives_supervision} />
                                    <DetailItem label="Attended Training Topics" value={profile.attended_training_topics} fullWidth />
                                    <DetailItem label="Other Training Details" value={profile.other_training_details} fullWidth />
                                </div>
                                <FileList label="Uploaded Certifications" files={profile.uploaded_certifications} />
                                <FileList label="Uploaded Training Evidence" files={profile.uploaded_training_evidence} />
                            </div>
                        </div>
                    )}

                    {hasStripeData && <Separator />}

                    {/* Stripe/Payment Info */}
                    {hasStripeData && (
                        <div>
                            <SectionHeader icon={CreditCard} title="Payment Information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Stripe Customer ID" value={profile.stripeCustomerId} fullWidth />
                                <DetailItem label="Stripe Subscription ID" value={profile.stripeSubscriptionId} fullWidth />
                                <DetailItem label="Subscription Status" value={profile.stripeSubscriptionStatus} />
                            </div>
                        </div>
                    )}

                    {profile.certificates?.length > 0 && <Separator />}

                    {/* Certificates */}
                    {profile.certificates?.length > 0 && (
                        <div>
                            <SectionHeader 
                                icon={Award} 
                                title="Digital Credentials" 
                                badge={<Badge variant="secondary">{profile.certificates.length}</Badge>}
                            />
                            <div className="space-y-3">
                                {profile.certificates.map((cert, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-slate-50">
                                        <p className="font-medium text-slate-900">{cert.title || 'Certificate'}</p>
                                        {cert.verificationCode && (
                                            <p className="text-sm text-slate-600 mt-1">
                                                Code: <span className="font-mono">{cert.verificationCode}</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(profile.jobViewTracker || profile.notes) && <Separator />}

                    {/* Additional Data */}
                    {(profile.jobViewTracker || profile.notes) && (
                        <div>
                            <SectionHeader icon={Calendar} title="Additional Information" />
                            <div className="space-y-6">
                                {profile.jobViewTracker?.date && (
                                    <DetailItem 
                                        label="Last Job Board View" 
                                        value={format(new Date(profile.jobViewTracker.date), 'PPpp')} 
                                    />
                                )}
                                <DetailItem label="Admin Notes" value={profile.notes} fullWidth />
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}