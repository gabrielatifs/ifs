import React, { useEffect, useState } from 'react';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { Event } from '@ifs/shared/api/entities';
import { EventSignup } from '@ifs/shared/api/entities';
import { sendEmail } from '@ifs/shared/api/functions';
import { addZoomRegistrant } from '@ifs/shared/api/functions';
import { syncToSupabase } from '@ifs/shared/api/functions';
import { createPageUrl } from '@ifs/shared/utils';
import { Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { addToMailerLite } from '@ifs/shared/api/functions';
import { addToApollo } from '@ifs/shared/api/functions';
import { ifs } from '@ifs/shared/api/ifsClient';
import { OrgInvite } from '@ifs/shared/api/entities';
import { wrapEmailHtml } from '@ifs/shared/emails/wrapper';
import { supabase } from '@ifs/shared/lib/supabase';

const getEmailWrapper = (content) => wrapEmailHtml(content);

export default function ApplicationProcessing() {
    const { user, loading, updateUserProfile } = useUser();
    const [status, setStatus] = useState('Initializing...');
    const [welcomeInFlight, setWelcomeInFlight] = useState(false);

    const RESEND_WELCOME_TEMPLATE_ID = "d642e732-bd83-4e87-a3dd-4a5dbab09d6f";

    const sendWelcomeEmailFromTemplate = async ({ displayName, firstName, membershipType, email }) => {
        if (!RESEND_WELCOME_TEMPLATE_ID) {
            throw new Error("Missing Resend welcome template id");
        }

        const resolvedFirstName = firstName || displayName || "Member";

        await sendEmail({
            to: email,
            template_id: RESEND_WELCOME_TEMPLATE_ID,
            template_data: {
                firstName: resolvedFirstName,
                membershipType: membershipType || "Member",
            },
        });
    };

    const markWelcomeSent = async () => {
        sessionStorage.setItem('welcome_email_sent', 'true');
        try {
            await updateUserProfile({ welcomeEmailSentAt: new Date().toISOString() });
        } catch (emailStampError) {
            console.warn('[DEBUG] Failed to record welcome email timestamp:', emailStampError);
        }
    };

    const sendWelcomeOnce = async (sendFn) => {
        const alreadySent =
            Boolean(user?.welcomeEmailSentAt) ||
            sessionStorage.getItem('welcome_email_sent') === 'true';
        if (alreadySent || welcomeInFlight) {
            return false;
        }
        setWelcomeInFlight(true);
        sessionStorage.setItem('welcome_email_sent', 'true');
        try {
            await sendFn();
            await markWelcomeSent();
            return true;
        } finally {
            setWelcomeInFlight(false);
        }
    };

    const generateCredential = async (payload) => {
        const { data, error } = await supabase.functions.invoke('generateDigitalCredential', {
            body: payload,
        });
        if (error) {
            throw error;
        }
        return data;
    };

    useEffect(() => {
        if (loading || !user) return;

        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment') === 'success';
        const isFullMember = user.membershipType === 'Full';
        
        console.log('[ApplicationProcessing] ========================================');
        console.log('[ApplicationProcessing] User:', user.email);
        console.log('[ApplicationProcessing] isFullMember:', isFullMember);
        console.log('[ApplicationProcessing] paymentSuccess:', paymentSuccess);
        console.log('[ApplicationProcessing] onboarding_completed:', user.onboarding_completed);
        console.log('[ApplicationProcessing] needsApplicationProcessing:', user.needsApplicationProcessing);
        console.log('[ApplicationProcessing] ========================================');
        


        const setupEventAndAccount = async () => {
            const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.full_name || 'Member';
            
            try {
                // Get event details from sessionStorage
                const postLoginRedirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
                if (!postLoginRedirectUrl || (!postLoginRedirectUrl.includes('EventDetails') && !postLoginRedirectUrl.includes('WorkshopDetails'))) {
                    throw new Error('No event registration found in session');
                }

                const eventId = new URL(postLoginRedirectUrl, window.location.origin).searchParams.get('id');
                if (!eventId) {
                    throw new Error('No event ID found in redirect URL');
                }

                setStatus('Loading event details...');
                const event = await Event.get(eventId);

                setStatus('Setting up your membership benefits...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Add to Apollo.io CRM
                try {
                    console.log('[ApplicationProcessing] 🚀 Adding user to Apollo.io...');
                    await addToApollo();
                    console.log('[ApplicationProcessing] ✅ Successfully added to Apollo.io');
                } catch (apolloError) {
                    console.error('[ApplicationProcessing] ⚠️ Apollo.io integration failed:', apolloError);
                }
                
                // Add to "Application Completed" MailerLite group
                try {
                    console.log('[ApplicationProcessing] 🚀 Adding user to MailerLite Application Completed group...');
                    
                    await addToMailerLite({ groupId: '170353150817993796' });
                    
                    console.log('[ApplicationProcessing] ✅ Successfully added to Application Completed group');
                } catch (mailerliteError) {
                    console.error('[ApplicationProcessing] ⚠️ MailerLite group assignment failed:', mailerliteError);
                    console.error('[ApplicationProcessing] Error details:', {
                        message: mailerliteError.message,
                        response: mailerliteError.response?.data,
                        status: mailerliteError.response?.status
                    });
                }
                
                setStatus('Syncing your account...');
                try {
                    console.log('[ApplicationProcessing] Syncing user to Supabase database (with Associate ID)...');
                    const supabaseResult = await syncToSupabase();
                    if (supabaseResult?.data?.success) {
                        console.log('[ApplicationProcessing] Successfully synced to Supabase');
                    } else {
                        console.error('[ApplicationProcessing] Supabase sync returned non-success:', supabaseResult);
                    }
                } catch (supabaseError) {
                    console.error('[ApplicationProcessing] Supabase sync failed:', supabaseError);
                }

                setStatus('Generating your digital credential...');
                let credentialCreated = false;
                try {
                    const credentialResponse = await generateCredential({
                        userId: user.id,
                        authId: user.authId,
                        userName: displayName,
                        userEmail: user.email,
                        membershipType: user.membershipType,
                        membershipStatus: user.membershipStatus,
                        credentialType: 'Associate Membership',
                        metadata: {}
                    });
                    const createdCredential =
                        credentialResponse?.credential || credentialResponse?.data?.credential;
                    if (!createdCredential) {
                        console.warn('[ApplicationProcessing] Credential response missing credential payload:', credentialResponse);
                    }
                    credentialCreated = true;
                    console.log('[ApplicationProcessing] Digital credential generated successfully');
                } catch (certError) {
                    console.error('[ApplicationProcessing] Digital credential generation failed, but continuing with registration:', certError);
                }

setStatus(`Registering you for "${event.title}"...`);
                
                let zoomJoinUrl = null;
                let zoomRegistrationFailed = false;

                // Handle Zoom registration if event has Zoom meeting
                if (event.zoomMeetingId) {
                    try {
                        console.log('[DEBUG] Attempting Zoom registration for new signup:', { 
                            meetingId: event.zoomMeetingId, 
                            email: user.email 
                        });
                        
                        const { data: zoomResult } = await addZoomRegistrant({
                            meetingId: event.zoomMeetingId,
                            firstName: user.firstName || displayName.split(' ')[0] || 'Attendee',
                            lastName: user.lastName || displayName.split(' ').slice(1).join(' ') || '',
                            email: user.email
                        });

                        if (zoomResult.success && zoomResult.joinUrl) {
                            zoomJoinUrl = zoomResult.joinUrl;
                            console.log('[DEBUG] Zoom registration successful for new signup');
                        } else {
                            zoomRegistrationFailed = true;
                            console.log('[DEBUG] Zoom registration failed for new signup:', zoomResult.error || 'Unknown error');
                        }
                    } catch (zoomError) {
                        console.error('[DEBUG] Zoom registration error for new signup:', zoomError);
                        zoomRegistrationFailed = true;
                    }
                }

                // Create event signup record
                await EventSignup.create({
                    userId: user.id,
                    eventId: event.id,
                    userEmail: user.email,
                    userName: displayName,
                    eventTitle: event.title,
                    eventDate: event.date,
                    eventType: event.type,
                    eventLocation: event.location,
                    zoomJoinUrl: zoomJoinUrl
                });

                setStatus('Sending your event confirmation email...');
                try {
                    const eventDate = format(new Date(event.date), 'EEEE, d MMMM yyyy');
                    const eventTimeDisplay = event.time || (event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : 'Time TBA');

                    await sendEmail({
                        to: user.email,
                        template: {
                            id: '516478cf-b7f9-4232-a295-c1a8465ed4ce',
                            variables: {
                                firstName: currentUser.firstName || displayName.split(' ')[0] || 'Member',
                                eventTitle: event.title,
                                eventDate,
                                eventTime: eventTimeDisplay,
                                eventLocation: event.location || 'Online',
                                joinLink: zoomJoinUrl || undefined,
                                meetingId: event.zoomMeetingId || undefined,
                                meetingPassword: event.zoomMeetingPassword || undefined,
                            },
                        },
                    });
                } catch (emailError) {
                    console.error('[DEBUG] Event confirmation email failed, but continuing:', emailError);
                }

                await sendWelcomeOnce(async () => {
                    setStatus('Sending your welcome email...');
                    try {
                        await sendWelcomeEmailFromTemplate({
                            displayName,
                            firstName: currentUser.firstName,
                            membershipType: currentUser.membershipType,
                            email: user.email
                        });
                    } catch (emailError) {
                        console.error('[DEBUG] Welcome email sending failed, but continuing:', emailError);
                    }
                });

                // Verify organisation membership (should already be set from Onboarding)
                setStatus('Verifying organisation membership...');
                
                // Refresh user data to get latest org info
                const refreshedUser = await ifs.auth.me();
                
                if (refreshedUser.organisationId) {
                    console.log('[ApplicationProcessing] ✅ User successfully added to organisation:', refreshedUser.organisationName);
                    setStatus(`Confirmed: You're part of ${refreshedUser.organisationName}!`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.log('[ApplicationProcessing] ⚠️ User has no organisation');
                }
                
                // Update user profile - ALWAYS set onboarding_completed TRUE
                setStatus('Finalizing your account...');
                try {
                    await updateUserProfile({
                        onboarding_completed: true,
                        needsApplicationProcessing: false
                    });
                } catch (updateError) {
                    console.error('[ApplicationProcessing] Failed to update user profile, attempting direct update:', updateError);
                    await ifs.asServiceRole.entities.User.update(user.id, {
                        onboarding_completed: true,
                        needsApplicationProcessing: false
                    });
                }

                setStatus('Complete! Redirecting...');
                await new Promise(resolve => setTimeout(resolve, 1500));

                // ALWAYS redirect to MembershipPlans
                const inviteId = sessionStorage.getItem('pending_invite_id');
                const membershipUrl = inviteId 
                    ? createPageUrl('MembershipPlans') + `?invite=${inviteId}`
                    : createPageUrl('MembershipPlans');

                console.log('[ApplicationProcessing] Event signup complete, redirecting to MembershipPlans');
                sessionStorage.setItem('just_completed_onboarding', 'true');
                sessionStorage.removeItem('has_seen_welcome_modal');
                sessionStorage.removeItem('postLoginRedirectUrl');
                window.location.href = membershipUrl;

            } catch (error) {
                console.error('Event registration setup failed:', error);
                // Fall back to regular account setup
                setStatus('Failed to set up event. Attempting general account setup...');
                await setupAccount();
            }
        };

        const setupAccount = async () => {
            const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.full_name || 'Member';
            const urlParams = new URLSearchParams(window.location.search);
            const paymentSuccess = urlParams.get('payment') === 'success';

            try {
                setStatus('Setting up your membership benefits...');

                // CRITICAL: If payment just succeeded, wait for webhook to complete
                let currentUser = user;
                if (paymentSuccess) {
                    console.log('[ApplicationProcessing] Payment success - waiting for webhook to complete...');
                    setStatus('Processing your payment...');

                    // Wait and retry up to 10 times (20 seconds total) for webhook to update user
                    let attempts = 0;
                    const maxAttempts = 10;

                    while (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        currentUser = await ifs.auth.me();

                        console.log('[ApplicationProcessing] Attempt', attempts + 1, '- User check:', {
                            membershipType: currentUser.membershipType,
                            cpdHours: currentUser.cpdHours,
                            hasSubscription: !!currentUser.stripeSubscriptionId,
                            hasTrial: !!currentUser.subscriptionTrialEnd
                        });

                        // Check if webhook completed (user is Full member with CPD hours and subscription)
                        if (currentUser.membershipType === 'Full' && 
                            currentUser.stripeSubscriptionId && 
                            (currentUser.cpdHours > 0 || currentUser.totalCpdEarned > 0)) {
                            console.log('[ApplicationProcessing] ✅ Webhook completed successfully!');
                            break;
                        }

                        attempts++;
                        if (attempts < maxAttempts) {
                            setStatus(`Processing payment... (${attempts}/${maxAttempts})`);
                        }
                    }

                    if (attempts >= maxAttempts) {
                        console.error('[ApplicationProcessing] ⚠️ Webhook may not have completed in time');
                    }
                }

                const isFullMember = currentUser.membershipType === 'Full';

                setStatus('Setting up your membership benefits...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Add to Apollo.io CRM
                try {
                    console.log('[ApplicationProcessing] 🚀 Adding user to Apollo.io...');
                    await addToApollo();
                    console.log('[ApplicationProcessing] ✅ Successfully added to Apollo.io');
                } catch (apolloError) {
                    console.error('[ApplicationProcessing] ⚠️ Apollo.io integration failed:', apolloError);
                }
                
                // Add to "Application Completed" MailerLite group
                try {
                    console.log('[ApplicationProcessing] 🚀 Adding user to MailerLite Application Completed group...');
                    
                    await addToMailerLite({ groupId: '170353150817993796' });
                    
                    console.log('[ApplicationProcessing] ✅ Successfully added to Application Completed group');
                } catch (mailerliteError) {
                    console.error('[ApplicationProcessing] ⚠️ MailerLite group assignment failed:', mailerliteError);
                    console.error('[ApplicationProcessing] Error details:', {
                        message: mailerliteError.message,
                        response: mailerliteError.response?.data,
                        status: mailerliteError.response?.status
                    });
                }
                
                // Verify webhook completed for Full Members
                if (isFullMember && paymentSuccess) {
                    console.log('[ApplicationProcessing] Verifying Full Member setup...');
                    console.log('[ApplicationProcessing] CPD Hours:', currentUser.cpdHours);
                    console.log('[ApplicationProcessing] Trial End:', currentUser.subscriptionTrialEnd);
                    setStatus('Your Full Membership is active!');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                setStatus('Syncing your account...');
                try {
                    console.log('[ApplicationProcessing] Syncing user to Supabase database...');
                    const supabaseResult = await syncToSupabase();
                    if (supabaseResult?.data?.success) {
                        console.log('[ApplicationProcessing] Successfully synced to Supabase');
                    } else {
                        console.error('[ApplicationProcessing] Supabase sync returned non-success:', supabaseResult);
                    }
                } catch (supabaseError) {
                    console.error('[ApplicationProcessing] Supabase sync failed:', supabaseError);
                }

                setStatus('Generating your digital credential...');
                let credentialCreated = false;
                try {
                    const credentialType = isFullMember ? 'Full Membership' : 'Associate Membership';
                    console.log('[ApplicationProcessing] Generating', credentialType, 'credential...');

                    const credentialResponse = await generateCredential({
                        userId: user.id,
                        authId: user.authId,
                        userName: displayName,
                        userEmail: user.email,
                        membershipType: user.membershipType,
                        membershipStatus: user.membershipStatus,
                        credentialType: credentialType,
                        metadata: {}
                    });
                    const createdCredential =
                        credentialResponse?.credential || credentialResponse?.data?.credential;
                    if (!createdCredential) {
                        console.warn('[ApplicationProcessing] Credential response missing credential payload:', credentialResponse);
                    }
                    credentialCreated = true;
                    console.log('[ApplicationProcessing] Digital credential generated successfully');
                } catch (certError) {
                    console.error('[ApplicationProcessing] Digital credential generation failed, but continuing with registration:', certError);
                }

                await sendWelcomeOnce(async () => {
                    setStatus('Sending your welcome email...');
                    try {
                        await sendWelcomeEmailFromTemplate({
                            displayName,
                            firstName: currentUser.firstName,
                            membershipType: currentUser.membershipType,
                            email: user.email
                        });
                    } catch (emailError) {
                        console.error('[DEBUG] Welcome email sending failed, but continuing:', emailError);
                    }
                });

                // Verify organisation membership (should already be set from Onboarding)
                setStatus('Verifying organisation membership...');
                
                // Refresh user data to get latest org info
                const refreshedUser = await ifs.auth.me();
                
                if (refreshedUser.organisationId) {
                    console.log('[ApplicationProcessing] ✅ User successfully added to organisation:', refreshedUser.organisationName);
                    setStatus(`Confirmed: You're part of ${refreshedUser.organisationName}!`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.log('[ApplicationProcessing] ⚠️ User has no organisation');
                }
                
                // Update user profile - ALWAYS set onboarding_completed TRUE
                setStatus('Finalizing your account...');
                
                console.log('[ApplicationProcessing] Setting onboarding_completed: true');
                
                try {
                    await updateUserProfile({
                        onboarding_completed: true,
                        needsApplicationProcessing: false
                    });
                } catch (updateError) {
                    console.error('[ApplicationProcessing] Failed to update user profile, attempting direct update:', updateError);
                    await ifs.asServiceRole.entities.User.update(user.id, {
                        onboarding_completed: true,
                        needsApplicationProcessing: false
                    });
                }

                setStatus('Complete! Redirecting...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // ALWAYS redirect to MembershipPlans - it will handle next steps
                const inviteId = sessionStorage.getItem('pending_invite_id');
                const paymentParam = (isFullMember && paymentSuccess) ? '&payment=success' : '';
                const membershipUrl = inviteId 
                    ? createPageUrl('MembershipPlans') + `?invite=${inviteId}${paymentParam}`
                    : createPageUrl('MembershipPlans') + (paymentParam ? `?payment=success` : '');
                
                console.log('[ApplicationProcessing] Setup complete, redirecting to MembershipPlans');
                sessionStorage.setItem('just_completed_onboarding', 'true');
                sessionStorage.removeItem('has_seen_welcome_modal');
                window.location.href = membershipUrl;

            } catch (error) {
                console.error('[ApplicationProcessing] Account setup failed:', error);
                setStatus('Setup encountered an error. Redirecting...');
                
                // CRITICAL: Even on complete failure, try to clear the processing flag to unblock user
                try {
                    await updateUserProfile({
                        needsApplicationProcessing: false,
                        onboarding_completed: true
                    });
                } catch (finalError) {
                    console.error('[ApplicationProcessing] Final update failed:', finalError);
                }
                
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Preserve invite ID if present
                const inviteId = sessionStorage.getItem('pending_invite_id');
                const membershipUrl = inviteId 
                    ? createPageUrl('MembershipPlans') + `?invite=${inviteId}`
                    : createPageUrl('MembershipPlans');
                
                sessionStorage.setItem('just_completed_onboarding', 'true');
                sessionStorage.removeItem('has_seen_welcome_modal');
                window.location.href = membershipUrl;
            }
        };

        // Check if this is an event signup flow
        const postLoginRedirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
        if (postLoginRedirectUrl && (postLoginRedirectUrl.includes('EventDetails') || postLoginRedirectUrl.includes('WorkshopDetails'))) {
            console.log('[ApplicationProcessing] Event signup flow detected');
            setupEventAndAccount();
        } else {
            console.log('[ApplicationProcessing] Regular account setup flow');
            setupAccount();
        }

    }, [user, loading]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Setting up your account</h1>
                    <p className="text-slate-600">Please wait while we prepare everything for you...</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-sm text-slate-700">{status}</span>
                    </div>
                    
                    <div className="w-full bg-purple-100 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">
                        This usually takes just a few moments. Please don't close this window.
                    </p>
                </div>
            </div>
        </div>
    );
}
