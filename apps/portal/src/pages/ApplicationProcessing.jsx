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
import { base44 } from '@ifs/shared/api/base44Client';
import { OrgInvite } from '@ifs/shared/api/entities';
import { supabase } from '@ifs/shared/lib/supabase';

const getEmailWrapper = (content) => {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { background-color: #5e028f; padding: 30px; text-align: center; color: #ffffff; }
            .content { padding: 30px 40px; color: #333; line-height: 1.6; }
            .footer { background-color: #f4f4f7; padding: 20px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #e2e2e2; }
            p { margin-bottom: 1em; }
            a { color: #5e028f; text-decoration: none; }
            a:hover { text-decoration: underline; }
            h1 { color: #333; font-size: 24px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: white; margin: 0; font-size: 28px;">Independent Federation for Safeguarding</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p style="margin: 0;">&copy; ${year} Independent Federation for Safeguarding. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">6-8 Revenge Road, Chatham, ME5 8UD</p>
                <p style="margin: 5px 0 0 0;"><a href="mailto:info@ifs-safeguarding.co.uk" style="color: #5e028f;">info@ifs-safeguarding.co.uk</a></p>
            </div>
        </div>
    </body>
    </html>`;
};

export default function ApplicationProcessing() {
    const { user, loading, updateUserProfile } = useUser();
    const [status, setStatus] = useState('Initializing...');

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

                setStatus('Sending your welcome and event confirmation email...');

                // Send combined welcome + event confirmation email
                try {
                    const eventDate = format(new Date(event.date), 'EEEE, d MMMM yyyy');
                    const eventTimeDisplay = event.time || (event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : 'Time TBA');

                    let zoomDetailsHtml = '';
                    if (event.zoomMeetingId) {
                        zoomDetailsHtml = `
                            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 18px;">📺 Join the Workshop Online</h3>
                                ${zoomJoinUrl ? `<p style="margin: 10px 0;"><strong>🔗 Your Personal Join URL:</strong><br><a href="${zoomJoinUrl}" style="color: #0369a1; word-break: break-all; font-weight: bold;">${zoomJoinUrl}</a></p>` : ''}
                                <p style="margin: 10px 0;"><strong>🆔 Meeting ID:</strong> ${event.zoomMeetingId}</p>
                                ${event.zoomMeetingPassword ? `<p style="margin: 10px 0;"><strong>🔐 Password:</strong> ${event.zoomMeetingPassword}</p>` : ''}
                                ${zoomRegistrationFailed ? `<p style="margin: 15px 0 0 0; font-size: 14px; color: #b45309; background-color: #fef3c7; padding: 10px; border-radius: 4px;"><strong>⚠️ Note:</strong> Automatic registration couldn't be completed, but you can still join using the details above.</p>` : ''}
                                <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;"><em>💡 We recommend joining 5-10 minutes early to test your connection.</em></p>
                            </div>
                        `;
                    }

                    const credentialNote = credentialCreated
                        ? '<p style="font-size: 16px; line-height: 1.6;">We\'re delighted to have you as part of our community. Your digital membership credential is now available in your portal, and we look forward to seeing you at the workshop!</p>'
                        : '<p style="font-size: 16px; line-height: 1.6;">We\'re delighted to have you as part of our community. We look forward to seeing you at the workshop! Your digital membership credential will be available in your portal shortly.</p>';

                    const combinedEmailContent = getEmailWrapper(`
                        <h1 style="color: #333; font-size: 32px; margin-bottom: 20px;">🎉 Welcome to IfS & Event Confirmed!</h1>
                        <p style="font-size: 18px; color: #333;">Dear ${displayName},</p>
                        <p style="font-size: 16px; line-height: 1.6;">Congratulations! You are now officially an <strong>Associate Member</strong> of the Independent Federation for Safeguarding, and you're registered for the workshop:</p>
                        
                        <div style="background-color: #fafafa; border-left: 4px solid #5e028f; padding: 20px; margin: 20px 0;">
                            <h2 style="color: #5e028f; margin: 0 0 10px 0; font-size: 20px;">${event.title}</h2>
                            <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
                            <p style="margin: 5px 0;"><strong>🕒 Time:</strong> ${eventTimeDisplay}</p>
                            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${event.location}</p>
                        </div>
                        
                        ${zoomDetailsHtml}
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #28a745; margin: 25px 0;">
                            <h2 style="color: #28a745; font-size: 20px; margin-top: 0;">Your Associate Membership Benefits Are Now Active:</h2>
                            <ul style="color: #333; line-height: 1.8;">
                                <li><strong>Monthly Professional Development Workshops</strong> - Free access to expert-led sessions</li>
                                <li><strong>Community Forum Access</strong> - Connect with fellow safeguarding professionals</li>
                                <li><strong>Essential Resources Library</strong> - Access to key safeguarding guidance and tools</li>
                                <li><strong>Post-Nominal Designation</strong> - Use AMIFS after your name</li>
                                <li><strong>Digital Membership Credential</strong> - Verified professional recognition you can share</li>
                                <li><strong>Career Opportunities Platform</strong> - Access to 3 job views per day</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://ifs-safeguarding.co.uk/Dashboard" style="display: inline-block; background-color: #5e028f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Access Your Portal</a>
                        </div>
                        
                        ${credentialNote}
                        <p style="font-size: 16px;">Best regards,<br><strong>The IfS Team</strong></p>
                    `);

                    await sendEmail({
                        to: user.email,
                        subject: `🎉 Welcome to IfS - Event Confirmed: ${event.title}`,
                        html: combinedEmailContent,
                        from_name: "Independent Federation for Safeguarding"
                    });

                    console.log('[DEBUG] Combined welcome + event confirmation email sent successfully');
                } catch (emailError) {
                    console.error('[DEBUG] Email sending failed, but continuing:', emailError);
                    // Don't throw - continue with profile update
                }

                // Verify organisation membership (should already be set from Onboarding)
                setStatus('Verifying organisation membership...');
                
                // Refresh user data to get latest org info
                const refreshedUser = await base44.auth.me();
                
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
                    await base44.asServiceRole.entities.User.update(user.id, {
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
                        currentUser = await base44.auth.me();

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

// Send welcome email ONLY for Associates (webhook handles Full Member emails)
                if (!isFullMember || !paymentSuccess) {
                    setStatus('Sending your welcome email...');
                    try {
                        const credentialNote = credentialCreated
                            ? '<p style="font-size: 16px; line-height: 1.6;">We\'re delighted to have you as part of our community of safeguarding professionals. Your digital membership credential is now available in your portal.</p>'
                            : '<p style="font-size: 16px; line-height: 1.6;">We\'re delighted to have you as part of our community of safeguarding professionals. Your digital membership credential will be available in your portal shortly.</p>';

                        const emailContent = getEmailWrapper(`
                            <h1 style="color: #333; font-size: 32px; margin-bottom: 20px;">🎉 Welcome to IfS!</h1>
                            <p style="font-size: 18px; color: #333;">Dear ${displayName},</p>
                            <p style="font-size: 16px; line-height: 1.6;">Congratulations! You are now officially an <strong>Associate Member</strong> of the Independent Federation for Safeguarding.</p>
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #5e028f; margin: 25px 0;">
                                <h2 style="color: #5e028f; font-size: 20px; margin-top: 0;">Your Associate Membership Benefits Are Now Active:</h2>
                                <ul style="color: #333; line-height: 1.8;">
                                    <li><strong>Monthly Professional Development Workshops</strong> - Free access to expert-led sessions</li>
                                    <li><strong>Community Forum Access</strong> - Connect with fellow safeguarding professionals</li>
                                    <li><strong>Essential Resources Library</strong> - Access to key safeguarding guidance and tools</li>
                                    <li><strong>Post-Nominal Designation</strong> - Use AMIFS after your name</li>
                                    <li><strong>Digital Membership Credential</strong> - Verified professional recognition you can share</li>
                                    <li><strong>Career Opportunities Platform</strong> - Access to 3 job views per day</li>
                                </ul>
                            </div>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://ifs-safeguarding.co.uk/Dashboard" style="display: inline-block; background-color: #5e028f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Access Your Portal</a>
                            </div>
                            ${credentialNote}
                            <p style="font-size: 16px;">Best regards,<br><strong>The IfS Team</strong></p>
                        `);

                        await sendEmail({
                            to: user.email,
                            subject: "🎉 Welcome to IfS - Your Associate Membership is Active!",
                            html: emailContent,
                            from_name: "Independent Federation for Safeguarding"
                        });
                    } catch (emailError) {
                        console.error('[DEBUG] Welcome email sending failed, but continuing:', emailError);
                    }
                } else {
                    console.log('[ApplicationProcessing] Full Member payment - webhook will send trial/upgrade email');
                    setStatus('Welcome email will arrive shortly...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // Verify organisation membership (should already be set from Onboarding)
                setStatus('Verifying organisation membership...');
                
                // Refresh user data to get latest org info
                const refreshedUser = await base44.auth.me();
                
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
                    await base44.asServiceRole.entities.User.update(user.id, {
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
