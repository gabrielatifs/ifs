import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, User as UserIcon, ShieldCheck, Sparkles, Award, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { sendEmail } from '@/api/functions';
import { createCheckout } from '@/api/functions';
import { generateCertificate } from '@/api/functions';
import { useUser } from '../components/providers/UserProvider';
import { customLoginWithRedirect } from '../components/utils/auth';
import { addToMailerLite } from '@/api/functions';
import PolicyModal from '../components/modals/PolicyModal';
import ReferralModal from '../components/modals/ReferralModal';
import { getCitySuggestions } from '@/api/functions';
import { getCountries } from '@/api/functions';
import { OrgInvite } from '@/api/entities';
import { useLocation } from 'react-router-dom';
import { acceptOrgInvite } from '@/api/functions';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
            .header { background-color: #5e028f; padding: 20px; text-align: center; color: #ffffff; }
            .header img { max-width: 150px; height: auto; }
            .content { padding: 30px 40px; color: #333; line-height: 1.6; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
            .button { display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #5e028f; color: #ffffff; text-decoration: none; border-radius: 5px; }
            h1 { color: #333; font-size: 24px; }
            p { margin-bottom: 1em; }
            a { color: #5e028f; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: white; margin: 0; font-size: 24px;">Independent Federation for Safeguarding</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Independent Federation for Safeguarding. All rights reserved.</p>
                <p>IfS, 128 City Road, London, EC1V 2NX</p>
                <p><a href="mailto:info@ifs-safeguarding.co.uk">info@ifs-safeguarding.co.uk</a></p>
            </div>
        </div>
    </body>
    </html>`;
};


const sectors = [
    "Education", "Social Care", "Healthcare", "Local Authority", "Charity/Voluntary Sector", "Private Sector", "Faith Organisation", "Sports/Recreation", "Other"
];
const roles = ["Designated Safeguarding Lead", "Designated Safeguarding Officer or Deputy", "I have safeguarding responsibilities in addition to my job role"];
const trainingRefreshOptions = ["Every year", "Every 2 years", "Every 3 years", "Every 3-5 years", "5 years or more", "I haven't refreshed my training", "None of the above"];
const trainingOptions = ["Introduction to Child Protection", "Designated Safeguarding Lead Training", "Refresher Training for DSLs", "Safer Recruitment Training", "Online Safety Training", "Adult Safeguarding Training", "None of the above"];
const topicOptions = ["Statutory Guidance Updates (e.g., KCSIE)", "Managing Allegations Against Staff", "Working with External Agencies", "Child-on-Child-Abuse / Peer-on-Peer Abuse", "Online Safety & Digital Safeguarding", "Mental Health & Wellbeing", "Contextual Safeguarding", "Other (please provide details below)"];

export default function Onboarding() {
    const { user: authUser, loading: userLoading, updateUserProfile } = useUser();
    const [submitting, setSubmitting] = useState(false);
    const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const { toast } = useToast();
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [isEventSignupFlow, setIsEventSignupFlow] = useState(false);
    const [mailerliteAdded, setMailerliteAdded] = useState(false);
    const [autoOnboarding, setAutoOnboarding] = useState(false);
    const [pendingInviteId, setPendingInviteId] = useState(null);
    const [inviteOrgName, setInviteOrgName] = useState(null);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referrerEmail, setReferrerEmail] = useState(null);
    const location = useLocation();

    // Policy acceptance state
    const [policyAcceptance, setPolicyAcceptance] = useState({
        terms: false,
        privacy: false,
        cookie: false
    });
    const [policyModalOpen, setPolicyModalOpen] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState(null);

    // Countries and cities state
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [citySearchValue, setCitySearchValue] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        city: '',
        country: '',
        jobRole: '',
        organisationName: '',
        sector: '',
        other_sector: '',
        subsector: '',
        other_sub_sector: '',
        safeguarding_role: '',
        had_induction: false,
        completed_training: [],
        training_refresh_frequency: '',
        attended_training_topics: [],
        other_training_details: '',
        receives_supervision: false,
        membershipTier: '',
        referralCode: '',
    });
    const [subsectorOptions, setSubsectorOptions] = useState([]);

    // Initialize React Hook Form
    const form = useForm({
        mode: 'onChange',
        defaultValues: formData
    });

    useEffect(() => {
        if (!userLoading && !authUser) {
            const currentPath = window.location.pathname + window.location.search;
            customLoginWithRedirect(currentPath);
        }
    }, [authUser, userLoading]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const { data } = await getCountries();
                if (data.fallback) {
                    console.warn('[Onboarding] Using fallback country list');
                }
                setCountries(data.countries);
            } catch (error) {
                console.error('[Onboarding] Failed to fetch countries:', error);
                toast({
                    title: "Warning",
                    description: "Could not load full countries list. Using common countries.",
                    variant: "destructive"
                });
                setCountries([
                    { name: "United Kingdom", code: "GB" },
                    { name: "United States", code: "US" },
                    { name: "Ireland", code: "IE" },
                    { name: "Other", code: "XX" }
                ]);
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, [toast]);

    useEffect(() => {
        const loadGoogleMaps = async () => {
            if (!window.google) {
                try {
                    const response = await base44.functions.invoke('getGoogleMapsApiKey');
                    const apiKey = response.data?.key || response.key;

                    if (apiKey) {
                        const script = document.createElement('script');
                        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
                        script.async = true;
                        script.defer = true;
                        script.onload = initAutocomplete;
                        document.head.appendChild(script);
                    }
                } catch (error) {
                    console.error("Error fetching Google Maps API key:", error);
                }
            } else {
                initAutocomplete();
            }
        };

        loadGoogleMaps();

        function initAutocomplete() {
            const input = document.getElementById('onboarding-city-input');
            if (input && window.google) {
                const autocomplete = new window.google.maps.places.Autocomplete(input, {
                    types: ['(cities)'],
                    fields: ['address_components', 'formatted_address', 'name'],
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.formatted_address) {
                        const addressComponents = place.address_components;
                        let city = '';
                        let country = '';

                        if (addressComponents) {
                            for (const component of addressComponents) {
                                const types = component.types;
                                if (types.includes('locality') || types.includes('postal_town')) {
                                    city = component.long_name;
                                }
                                if (types.includes('country')) {
                                    country = component.long_name;
                                }
                            }
                        }

                        // Fallback for city if not found in locality
                        if (!city) {
                             const cityComponent = addressComponents.find(c => c.types.includes('administrative_area_level_2') || c.types.includes('sublocality_level_1'));
                             if (cityComponent) city = cityComponent.long_name;
                        }

                        // Use functional update to ensure latest state if needed, but handleInputChange wrapper is fine
                        // We need to call setFormData directly or via handleInputChange
                        setFormData(prev => ({
                            ...prev,
                            city: city || place.name, // Fallback to name if logic fails
                            country: country || prev.country
                        }));
                    }
                });
            }
        }
    }, []);

    useEffect(() => {
        if (userLoading || !authUser || mailerliteAdded) return;
        const addUserToMailerLite = async () => {
            try {
                const response = await addToMailerLite({ groupId: '170353141006469076' });
                if (response.data?.success) {
                    setMailerliteAdded(true);
                } else {
                    console.error('[Onboarding] Failed to add to MailerLite:', response.data);
                }
            } catch (error) {
                console.error('[Onboarding] Error adding to MailerLite:', error);
            }
        };
        addUserToMailerLite();
    }, [authUser, userLoading, mailerliteAdded, toast]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const intent = urlParams.get('intent');
        const orgSponsor = urlParams.get('orgSponsor');
        const redirect = urlParams.get('redirect');
        const isNewUser = urlParams.get('is_new_user');
        const inviteId = urlParams.get('invite');
        const referralCode = urlParams.get('ref');
        
        console.log('[Onboarding] Component loaded with params:', { inviteId, intent, authUser: !!authUser });
        
        // Store invite ID immediately
        if (inviteId) {
            console.log('[Onboarding] Storing invite ID:', inviteId);
            setPendingInviteId(inviteId);
            sessionStorage.setItem('pending_invite_id', inviteId);
        } else {
            const storedInviteId = sessionStorage.getItem('pending_invite_id');
            if (storedInviteId) {
                console.log('[Onboarding] Found stored invite ID:', storedInviteId);
                setPendingInviteId(storedInviteId);
            }
        }
        
        // CRITICAL: Accept organisation invite ONLY when user is authenticated
        const acceptInviteWhenReady = async () => {
            const inviteToAccept = inviteId || sessionStorage.getItem('pending_invite_id');
            
            if (inviteToAccept && authUser && !authUser.organisationId) {
                console.log('[Onboarding] ✅ User authenticated, accepting invite now:', inviteToAccept);
                try {
                    const { data } = await acceptOrgInvite({ inviteId: inviteToAccept });
                    if (data.success) {
                        console.log('[Onboarding] ✅ Invite accepted! Organisation:', data.organisationName);
                        setInviteOrgName(data.organisationName);
                        sessionStorage.setItem('just_joined_org', 'true');
                        sessionStorage.setItem('org_name', data.organisationName);
                        
                        toast({
                            title: "Organisation Joined",
                            description: `You've been added to ${data.organisationName}!`,
                            duration: 5000
                        });
                    }
                } catch (error) {
                    console.error('[Onboarding] ❌ Failed to accept invite:', error);
                }
            } else if (inviteToAccept && !authUser) {
                console.log('[Onboarding] ⏳ Invite present but user not yet authenticated, waiting...');
            }
        };
        
        acceptInviteWhenReady();

        const postLoginRedirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
        const isEventFlow = (redirect && (redirect.includes('EventDetails') || redirect.includes('WorkshopDetails'))) ||
                            (postLoginRedirectUrl && (postLoginRedirectUrl.includes('EventDetails') || postLoginRedirectUrl.includes('WorkshopDetails')));

        setIsEventSignupFlow(isEventFlow);

        if (isNewUser === 'true') {
            console.log('New user detected from login flow');
        }

        if (redirect) {
            const decodedRedirect = decodeURIComponent(redirect);
            setRedirectUrl(decodedRedirect);
            sessionStorage.setItem('postLoginRedirectUrl', decodedRedirect);
        }

        // Store referral code if present and show modal
        if (referralCode) {
            setFormData(prev => ({ ...prev, referralCode }));
            sessionStorage.setItem('referral_code', referralCode);
            
            // Fetch referrer info and show modal
            const fetchReferrerInfo = async () => {
                try {
                    const referrers = await base44.entities.User.filter({ referralCode });
                    if (referrers && referrers.length > 0) {
                        setReferrerEmail(referrers[0].email);
                    }
                    setShowReferralModal(true);
                } catch (error) {
                    console.error('Failed to fetch referrer info:', error);
                    setShowReferralModal(true); // Show modal anyway
                }
            };
            
            fetchReferrerInfo();
        }

        if (orgSponsor === 'true') {
            sessionStorage.setItem('orgSponsorFlow', 'true');
            setFormData(prev => ({ ...prev, membershipTier: 'full' }));
        } else if (intent === 'full' || intent === 'associate') {
            setFormData(prev => ({ ...prev, membershipTier: intent }));
        } else {
            setFormData(prev => ({ ...prev, membershipTier: 'associate' }));
        }
    }, []);

    useEffect(() => {
        if (userLoading || !authUser) return;

        // CRITICAL: If user has completed onboarding, they shouldn't be here
        if (authUser.onboarding_completed) {
            console.log('[Onboarding] User already completed onboarding, redirecting...');
            const storedRedirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
            sessionStorage.removeItem('postLoginRedirectUrl');
            window.location.href = storedRedirectUrl || createPageUrl('Dashboard');
            return;
        }

        // If user needs application processing, redirect there
        if (authUser.needsApplicationProcessing) {
            console.log('[Onboarding] User needs application processing, redirecting...');
            window.location.href = createPageUrl('ApplicationProcessing');
            return;
        }

        // Auto-onboard for Associate Members coming from Job Adverts
        const urlParams = new URLSearchParams(window.location.search);
        let intent = urlParams.get('intent');
        let redirect = urlParams.get('redirect') || sessionStorage.getItem('postLoginRedirectUrl');

        // Check session storage backups if params are missing
        if (!redirect && sessionStorage.getItem('pending_job_redirect')) {
            redirect = sessionStorage.getItem('pending_job_redirect');
        }
        if (!intent && sessionStorage.getItem('pending_job_intent')) {
            intent = sessionStorage.getItem('pending_job_intent');
        }

        const isJobFlow = redirect && (redirect.includes('JobDetails') || redirect.includes('Job'));

        if (authUser && !authUser.onboarding_completed && isJobFlow && intent === 'associate' && !autoOnboarding) {
            const performAutoOnboard = async () => {
                try {
                    setAutoOnboarding(true);
                    toast({ title: "Setting up your account...", duration: 2000 });

                    const fullName = authUser.full_name || '';
                    const nameParts = fullName.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    await updateUserProfile({
                        firstName: authUser.firstName || firstName,
                        lastName: authUser.lastName || lastName,
                        displayName: authUser.displayName || fullName,
                        membershipType: 'Associate',
                        membershipStatus: 'active',
                        onboarding_completed: true,
                    });

                    // Ensure notification preference exists
                    try {
                        const prefs = await base44.entities.NotificationPreference.filter({ userId: authUser.id });
                        if (prefs.length === 0) {
                            await base44.entities.NotificationPreference.create({
                                userId: authUser.id,
                                email: authUser.email,
                                weeklyJobAlerts: true
                            });
                        }
                    } catch (prefError) {
                        console.error("Failed to create notification preference:", prefError);
                    }
                    
                    // Clear session storage items
                    sessionStorage.removeItem('pending_job_redirect');
                    sessionStorage.removeItem('pending_job_intent');

                    window.location.href = redirect;
                } catch (error) {
                    console.error("Auto-onboarding failed:", error);
                    toast({ title: "Setup Failed", description: "Please complete your profile manually.", variant: "destructive" });
                    setAutoOnboarding(false);
                }
            };
            performAutoOnboard();
            return;
        }

        setFormData(prev => ({
            ...prev,
            firstName: authUser.firstName || '',
            lastName: authUser.lastName || '',
            phoneNumber: authUser.phoneNumber || '',
            displayName: authUser.displayName || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
            city: authUser.city || '',
            country: authUser.country || '',
            jobRole: authUser.jobRole || '',
            organisationName: authUser.organisationName || '',
            sector: authUser.sector || '',
            other_sector: authUser.other_sector || '',
            subsector: authUser.subsector || '',
            other_sub_sector: authUser.other_sub_sector || '',
            safeguarding_role: authUser.safeguarding_role || '',
            had_induction: authUser.had_induction || false,
            completed_training: authUser.completed_training || [],
            training_refresh_frequency: authUser.training_refresh_frequency || '',
            attended_training_topics: authUser.attended_training_topics || [],
            other_training_details: authUser.other_training_details || '',
            receives_supervision: authUser.receives_supervision || false,
            membershipTier: authUser.membershipType?.toLowerCase() === 'full' ? 'full' : (prev.membershipTier || 'associate'),
        }));

        if (authUser.sector) {
            const options = {
                "Education": ["Early Years", "Primary", "Secondary", "Further Education", "Higher Education", "Special School", "Alternative Provision"],
                "Social Care": ["Children's Residential Care", "Fostering/Adoption", "Adult Social Care"],
                "Healthcare": ["NHS Trust", "Primary Care", "Private Healthcare"],
            };
            const subSectorsForSector = options[authUser.sector] || [];
            if (subSectorsForSector.length > 0) {
                setSubsectorOptions([...subSectorsForSector, "Other"]);
            } else {
                setSubsectorOptions([]);
            }
        }
    }, [authUser, userLoading, redirectUrl]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSectorChange = (sector) => {
        setFormData(prev => ({ ...prev, sector, subsector: '', other_sector: '', other_sub_sector: '' }));
        const options = {
            "Education": ["Early Years", "Primary", "Secondary", "Further Education", "Higher Education", "Special School", "Alternative Provision"],
            "Social Care": ["Children's Residential Care", "Fostering/Adoption", "Adult Social Care"],
            "Healthcare": ["NHS Trust", "Primary Care", "Private Healthcare"],
        };
        const subSectorsForSector = options[sector] || [];
        if (subSectorsForSector.length > 0) {
            setSubsectorOptions([...subSectorsForSector, "Other"]);
        } else {
            setSubsectorOptions([]);
        }
    };

    const openPolicyModal = (e, policyType) => {
        e.preventDefault();
        setCurrentPolicy(policyType);
        setPolicyModalOpen(true);
    };

    const validateStep1 = () => {
        // Organisation name can be pre-filled from invite, check for that too
        const orgName = inviteOrgName || (authUser && authUser.organisationName) || formData.organisationName;

        const errors = {};
        if (!formData.firstName.trim()) {
            form.setError('firstName', { type: 'manual', message: 'First name is required' });
            errors.firstName = true;
        }
        if (!formData.lastName.trim()) {
            form.setError('lastName', { type: 'manual', message: 'Last name is required' });
            errors.lastName = true;
        }
        if (!formData.phoneNumber.trim()) {
            form.setError('phoneNumber', { type: 'manual', message: 'Phone number is required' });
            errors.phoneNumber = true;
        }
        if (!orgName.trim()) {
            form.setError('organisationName', { type: 'manual', message: 'Organisation name is required' });
            errors.organisationName = true;
        }
        if (!formData.jobRole.trim()) {
            form.setError('jobRole', { type: 'manual', message: 'Job role is required' });
            errors.jobRole = true;
        }

        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        const errors = {};
        if (!formData.sector) {
            form.setError('sector', { type: 'manual', message: 'Sector is required' });
            errors.sector = true;
        }
        if (!formData.safeguarding_role) {
            form.setError('safeguarding_role', { type: 'manual', message: 'Safeguarding role is required' });
            errors.safeguarding_role = true;
        }
        if (formData.sector === 'Other' && !formData.other_sector.trim()) {
            form.setError('other_sector', { type: 'manual', message: 'Please specify your sector' });
            errors.other_sector = true;
        }
        if (formData.subsector === 'Other' && !formData.other_sub_sector.trim()) {
            form.setError('other_sub_sector', { type: 'manual', message: 'Please specify your sub-sector' });
            errors.other_sub_sector = true;
        }
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        return true;
    };

    const validateStep4 = () => {
        const errors = {};
        if (!policyAcceptance.terms) {
            form.setError('terms', { type: 'manual', message: 'You must accept the Terms and Conditions' });
            errors.terms = true;
        }
        if (!policyAcceptance.privacy) {
            form.setError('privacy', { type: 'manual', message: 'You must accept the Privacy Policy' });
            errors.privacy = true;
        }
        if (!policyAcceptance.cookie) {
            form.setError('cookie', { type: 'manual', message: 'You must accept the Cookie Policy' });
            errors.cookie = true;
        }
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        let isValid = false;
        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
        } else if (currentStep === 3) {
            isValid = validateStep3();
        }

        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep === 4) {
             if (!validateStep1()) { setCurrentStep(1); return; }
             if (!validateStep2()) { setCurrentStep(2); return; }
             if (!validateStep3()) { return; }
             if (!validateStep4()) { return; }
        }
        if (!authUser) {
            toast({ title: "Authentication Error", description: "User not logged in. Please refresh and try again.", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        toast({ title: "Finalizing your application..." });

        try {
            const displayName = `${formData.firstName} ${formData.lastName}`.trim();
            const membershipTypeForProfile = formData.membershipTier === 'full' ? 'Full' : 'Associate';
            const isAssociate = formData.membershipTier === 'associate';
            const isOrgSponsorFlow = sessionStorage.getItem('orgSponsorFlow') === 'true';
            const isFull = formData.membershipTier === 'full';

            // CRITICAL: For Full Members going to payment, DON'T set membershipType yet
            // Webhook will set it after successful payment
            // For Associates, set it immediately since there's no payment
            let dataToSubmit = {
                ...formData,
                displayName: displayName,
                membershipType: isAssociate ? 'Associate' : undefined, // Only set for Associates
                membershipStatus: isAssociate ? 'active' : undefined, // Only set for Associates
                needsApplicationProcessing: isAssociate ? true : false, // Only for Associates
                onboarding_completed: false, // Will be set to true in ApplicationProcessing
            };

            console.log('[Onboarding] Updating user profile:', { 
                membershipType: membershipTypeForProfile, 
                needsApplicationProcessing: dataToSubmit.needsApplicationProcessing,
                isFull: isFull 
            });
            await updateUserProfile(dataToSubmit);

            // Generate referral code for new user
            try {
                await base44.functions.invoke('generateReferralCode', { userId: authUser.id });
            } catch (refError) {
                console.error("Failed to generate referral code:", refError);
            }

            // Process referral code if provided
            const storedReferralCode = sessionStorage.getItem('referral_code') || formData.referralCode;
            if (storedReferralCode) {
                try {
                    await base44.functions.invoke('processReferral', { referralCode: storedReferralCode });
                    sessionStorage.removeItem('referral_code');
                    toast({ 
                        title: "Referral Applied!", 
                        description: "You'll get your first month free when you upgrade to Full Membership.",
                        duration: 5000
                    });
                } catch (refError) {
                    console.error("Failed to process referral:", refError);
                    // Don't block onboarding if referral fails
                }
            }

            // Create/Update Applicant Tracking record
            try {
                await base44.functions.invoke('trackApplicationSubmission', { 
                    membershipType: membershipTypeForProfile 
                });
                } catch (trackingError) {
                console.error("Failed to update applicant tracking:", trackingError);
                // Continue execution, don't block user flow
                }

                // Create NotificationPreference for Associate members
                if (isAssociate) {
                try {
                    const prefs = await base44.entities.NotificationPreference.filter({ userId: authUser.id });
                    if (prefs.length === 0) {
                        await base44.entities.NotificationPreference.create({
                            userId: authUser.id,
                            email: authUser.email,
                            weeklyJobAlerts: true
                        });
                    }
                } catch (prefError) {
                    console.error("Failed to create notification preference:", prefError);
                }
                }

            if (isOrgSponsorFlow) {
                sessionStorage.removeItem('orgSponsorFlow');
                window.location.href = createPageUrl('RequestOrgPayment');
            } else if (formData.membershipTier === 'full') {
                console.log('[Onboarding] Full membership selected - redirecting to Stripe checkout');
                setRedirectingToCheckout(true);
                const productionOrigin = 'https://www.ifs-safeguarding.co.uk';
                const successUrl = `${productionOrigin}${createPageUrl('ApplicationProcessing')}?payment=success`;
                const cancelUrl = `${productionOrigin}${createPageUrl('JoinUs')}`;

                // Use the correct Full Membership price IDs
                // Monthly: price_1SSiWXDJm5OJGimXguAKyxBN (£20/month)
                // Annual: price_1SSiWGDJm5OJGimXnn2kZ6aO (£240/year)
                const { data } = await createCheckout({
                    successUrl,
                    cancelUrl,
                    priceId: 'price_1SSiWXDJm5OJGimXguAKyxBN', // Default to monthly
                    membershipTier: 'professional',
                    billingPeriod: 'monthly'
                });
                console.log('[Onboarding] Checkout response:', data);
                if (data.url) {
                    console.log('[Onboarding] Redirecting to Stripe:', data.url);
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Failed to create checkout session.');
                }
            } else {
                // Associate members - redirect to ApplicationProcessing
                console.log('Associate member onboarding complete, redirecting to ApplicationProcessing');
                window.location.href = createPageUrl('ApplicationProcessing');
            }

        } catch (error) {
            console.error("Error submitting application:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your application. Please try again.",
                variant: "destructive",
            });
            setSubmitting(false);
        }
    };

    if (userLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    const totalSteps = 4;
    const steps = [
        { number: 1, title: "Personal Information" },
        { number: 2, title: "Professional Background" },
        { number: 3, title: "Training & Development" },
        { number: 4, title: "Review & Submit" }
    ];

    const handleAcceptReferral = async () => {
        setShowReferralModal(false);
        // Set membership tier to full
        setFormData(prev => ({ ...prev, membershipTier: 'full' }));
        toast({
            title: "Referral Applied!",
            description: "Your first month will be free when you complete signup.",
            duration: 5000
        });
    };

    if (redirectingToCheckout) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center z-50">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Redirecting to secure checkout...</h2>
                    <p className="text-purple-100">Please wait while we prepare your payment</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster />
            <PolicyModal
                open={policyModalOpen}
                onOpenChange={setPolicyModalOpen}
                policyType={currentPolicy}
            />
            <ReferralModal
                open={showReferralModal}
                onOpenChange={setShowReferralModal}
                onAccept={handleAcceptReferral}
                referrerEmail={referrerEmail}
            />

            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
                {/* Top Navigation */}
                <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-white">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <span className="font-semibold">Institute of Safeguarding</span>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                        {/* Hero Section - Left Side */}
                        <div className="space-y-6 lg:col-span-5 lg:py-12">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                                    Join Our Community
                                </h1>
                                <p className="text-lg leading-relaxed text-purple-100">
                                    Complete your application to access professional development, digital certificates, and exclusive safeguarding resources.
                                </p>
                            </div>

                            {/* Progress Indicator */}
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">Your Progress</span>
                                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                                        Step {currentStep} of {totalSteps}
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
                                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                    />
                                </div>
                                <div className="mt-3 text-sm font-medium text-purple-100">
                                    {steps[currentStep - 1].title}
                                </div>
                            </div>

                            {/* Feature Highlights */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </span>
                                    <div>
                                        <div className="font-semibold text-white">CPD-Accredited Training</div>
                                        <div className="text-sm text-purple-100">Access exclusive professional development courses</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                                        <Award className="h-5 w-5 text-white" />
                                    </span>
                                    <div>
                                        <div className="font-semibold text-white">Instant Certificates</div>
                                        <div className="text-sm text-purple-100">Download verified digital certificates immediately</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                                        <Clock className="h-5 w-5 text-white" />
                                    </span>
                                    <div>
                                        <div className="font-semibold text-white">Quick Setup</div>
                                        <div className="text-sm text-purple-100">Complete your profile in under 5 minutes</div>
                                    </div>
                                </div>
                            </div>

                            {inviteOrgName && (
                                <div className="rounded-xl border border-green-400/30 bg-green-500/20 p-4 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-300" />
                                        <div className="font-semibold text-white">Organisation Invitation</div>
                                    </div>
                                    <div className="mt-1 text-sm text-green-100">You're joining: {inviteOrgName}</div>
                                </div>
                            )}
                        </div>

                        {/* Form Section - Right Side */}
                        <div className="lg:col-span-7">
                            <Card className="border-0 bg-white shadow-2xl">
                                <CardContent className="p-8 lg:p-10">
                                <Form {...form}>
                                <form onSubmit={handleSubmit}>
                            {/* Step 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                                            <UserIcon className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-bold text-purple-900 uppercase">Step 1 of 4</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
                                        <p className="text-gray-600">Let's start with your basic details</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.firstName}
                                                            onChange={(e) => {
                                                                handleInputChange('firstName', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('firstName');
                                                            }}
                                                            className="mt-2"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.lastName}
                                                            onChange={(e) => {
                                                                handleInputChange('lastName', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('lastName');
                                                            }}
                                                            className="mt-2"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.phoneNumber}
                                                            onChange={(e) => {
                                                                handleInputChange('phoneNumber', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('phoneNumber');
                                                            }}
                                                            className="mt-2"
                                                            placeholder="+44 7000 000000"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="organisationName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Organisation Name *</FormLabel>
                                                    <FormControl>
                                                        {inviteOrgName || (authUser && authUser.organisationName) ? (
                                                            <>
                                                                <Input
                                                                    value={inviteOrgName || authUser.organisationName}
                                                                    disabled
                                                                    className="mt-2 bg-slate-50 text-slate-900 cursor-not-allowed"
                                                                />
                                                            </>
                                                        ) : (
                                                            <Input
                                                                {...field}
                                                                value={formData.organisationName}
                                                                onChange={(e) => {
                                                                    handleInputChange('organisationName', e.target.value);
                                                                    field.onChange(e);
                                                                    form.clearErrors('organisationName');
                                                                }}
                                                                className="mt-2"
                                                            />
                                                        )}
                                                    </FormControl>
                                                    {inviteOrgName || (authUser && authUser.organisationName) ? (
                                                        <p className="text-xs text-purple-600 mt-1">✓ Organisation set via invite</p>
                                                    ) : null}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                className="mt-2"
                                                placeholder="Enter your country"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="onboarding-city-input"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                className="mt-2"
                                                placeholder="Start typing your city..."
                                            />
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="jobRole"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Role *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.jobRole}
                                                        onChange={(e) => {
                                                            handleInputChange('jobRole', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('jobRole');
                                                        }}
                                                        className="mt-2"
                                                        placeholder="e.g., Designated Safeguarding Lead"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Referral Code Field */}
                                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                       <Label htmlFor="referralCode" className="text-sm font-semibold text-purple-900">
                                           Have a referral code?
                                       </Label>
                                       <Input
                                           id="referralCode"
                                           value={formData.referralCode}
                                           onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                                           placeholder="Enter referral code"
                                           className="mt-2 font-mono"
                                       />
                                       <p className="text-xs text-purple-600 mt-2">
                                           Get your first month of Full Membership free when you upgrade!
                                       </p>
                                    </div>
                                    </div>
                            )}

                            {/* Step 2: Professional Background */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                                            <UserIcon className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-bold text-purple-900 uppercase">Step 2 of 4</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Background</h2>
                                        <p className="text-gray-600">Tell us about your role and organisation</p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="sector"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sector *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.sector}
                                                        onChange={(e) => {
                                                            handleInputChange('sector', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('sector');
                                                        }}
                                                        className="mt-2"
                                                        placeholder="Enter your sector"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {formData.sector === 'Other' && (
                                        <FormField
                                            control={form.control}
                                            name="other_sector"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Please Specify Sector *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.other_sector}
                                                            onChange={(e) => {
                                                                handleInputChange('other_sector', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('other_sector');
                                                            }}
                                                            placeholder="e.g., Leisure and Tourism"
                                                            className="mt-2"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    <div>
                                        <Label htmlFor="subsector">Sub-sector</Label>
                                        <Input
                                            id="subsector"
                                            value={formData.subsector}
                                            onChange={(e) => handleInputChange('subsector', e.target.value)}
                                            className="mt-2"
                                            placeholder="Enter your sub-sector"
                                        />
                                    </div>
                                    {formData.subsector === 'Other' && (
                                        <FormField
                                            control={form.control}
                                            name="other_sub_sector"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Please Specify Sub-sector *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.other_sub_sector}
                                                            onChange={(e) => {
                                                                handleInputChange('other_sub_sector', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('other_sub_sector');
                                                            }}
                                                            placeholder="e.g., Academy Trust"
                                                            className="mt-2"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="safeguarding_role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-900">What is your current role in safeguarding? *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.safeguarding_role}
                                                        onChange={(e) => {
                                                            handleInputChange('safeguarding_role', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('safeguarding_role');
                                                        }}
                                                        className="mt-2"
                                                        placeholder="Enter your safeguarding role"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 3: Training & Development */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                                            <UserIcon className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-bold text-purple-900 uppercase">Step 3 of 4 - Optional</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Training & Development</h2>
                                        <p className="text-gray-600">Tell us about your professional development (all fields optional)</p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold text-gray-900">I have completed the following safeguarding training or qualifications:</Label>
                                        <Input
                                            id="completed_training"
                                            value={Array.isArray(formData.completed_training) ? formData.completed_training.join(', ') : formData.completed_training || ''}
                                            onChange={(e) => handleInputChange('completed_training', e.target.value)}
                                            className="mt-2"
                                            placeholder="Enter training completed (comma separated)"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold text-gray-900">I have had an induction in relation to my safeguarding role and responsibilities</Label>
                                        <Input
                                            id="had_induction"
                                            value={formData.had_induction ? 'Yes' : 'No'}
                                            onChange={(e) => handleInputChange('had_induction', e.target.value === 'Yes')}
                                            className="mt-2"
                                            placeholder="Enter Yes or No"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold text-gray-900">How often is your safeguarding training refreshed?</Label>
                                        <Input
                                            id="training_refresh_frequency"
                                            value={formData.training_refresh_frequency}
                                            onChange={(e) => handleInputChange('training_refresh_frequency', e.target.value)}
                                            className="mt-2"
                                            placeholder="Enter training refresh frequency"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-semibold text-gray-900">In the past 2 years, have you attended any training on the following topics?</Label>
                                        <Input
                                            id="attended_training_topics"
                                            value={Array.isArray(formData.attended_training_topics) ? formData.attended_training_topics.join(', ') : formData.attended_training_topics || ''}
                                            onChange={(e) => handleInputChange('attended_training_topics', e.target.value)}
                                            className="mt-2"
                                            placeholder="Enter topics (comma separated)"
                                        />
                                    </div>

                                    {formData.attended_training_topics?.includes("Other (please provide details below)") && (
                                        <div>
                                            <Label htmlFor="other_training_details" className="text-sm font-semibold text-slate-900">Please provide details of other training attended</Label>
                                            <Textarea
                                                id="other_training_details"
                                                value={formData.other_training_details}
                                                onChange={e => handleInputChange('other_training_details', e.target.value)}
                                                className="mt-2"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label className="text-sm font-semibold text-gray-900">I receive regular supervision which covers safeguarding practice</Label>
                                        <Input
                                            id="receives_supervision"
                                            value={formData.receives_supervision ? 'Yes' : 'No'}
                                            onChange={(e) => handleInputChange('receives_supervision', e.target.value === 'Yes')}
                                            className="mt-2"
                                            placeholder="Enter Yes or No"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review & Submit */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-bold text-purple-900 uppercase">Step 4 of 4</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                                        <p className="text-gray-600">Please review your application and accept our policies</p>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div><strong className="text-gray-900">Name:</strong> {formData.firstName} {formData.lastName}</div>
                                        <div><strong className="text-gray-900">Phone:</strong> {formData.phoneNumber}</div>
                                        <div><strong className="text-gray-900">Organisation:</strong> {formData.organisationName}</div>
                                        <div><strong className="text-gray-900">City:</strong> {formData.city}</div>
                                        <div><strong className="text-gray-900">Country:</strong> {formData.country}</div>
                                        <div className="md:col-span-2"><strong className="text-gray-900">Job Role:</strong> {formData.jobRole}</div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mt-4">Professional Background</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div><strong className="text-gray-900">Sector:</strong> {formData.sector === 'Other' ? `Other: ${formData.other_sector}` : formData.sector}</div>
                                        {formData.subsector && <div><strong className="text-gray-900">Sub-sector:</strong> {formData.subsector === 'Other' ? `Other: ${formData.other_sub_sector}` : formData.subsector}</div>}
                                        <div className="md:col-span-2"><strong className="text-gray-900">Safeguarding Role:</strong> {formData.safeguarding_role}</div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mt-4">Training & Development</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div><strong className="text-gray-900">Completed Training:</strong> {(formData.completed_training || []).join(', ') || 'None selected'}</div>
                                        <div><strong className="text-gray-900">Had Induction:</strong> {formData.had_induction ? 'Yes' : 'No'}</div>
                                        <div><strong className="text-gray-900">Training Refresh Frequency:</strong> {formData.training_refresh_frequency || 'Not specified'}</div>
                                        <div><strong className="text-gray-900">Attended Training Topics:</strong> {(formData.attended_training_topics || []).join(', ') || 'None selected'}</div>
                                        {formData.other_training_details && <div><strong className="text-gray-900">Other Training Details:</strong> {formData.other_training_details}</div>}
                                        <div><strong className="text-gray-900">Receives Supervision:</strong> {formData.receives_supervision ? 'Yes' : 'No'}</div>
                                    </div>

                                    <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Policy Acceptance *</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Please review and accept our policies to continue:
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="terms"
                                                    checked={policyAcceptance.terms}
                                                    onCheckedChange={(checked) =>
                                                        setPolicyAcceptance(prev => ({ ...prev, terms: checked }))
                                                    }
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openPolicyModal(e, 'terms')}
                                                        className="text-purple-600 hover:text-purple-700 underline font-semibold"
                                                    >
                                                        Terms and Conditions
                                                    </button>
                                                </Label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="privacy"
                                                    checked={policyAcceptance.privacy}
                                                    onCheckedChange={(checked) =>
                                                        setPolicyAcceptance(prev => ({ ...prev, privacy: checked }))
                                                    }
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openPolicyModal(e, 'privacy')}
                                                        className="text-purple-300 hover:text-purple-200 underline font-semibold"
                                                    >
                                                        Privacy Policy
                                                    </button>
                                                </Label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="cookie"
                                                    checked={policyAcceptance.cookie}
                                                    onCheckedChange={(checked) =>
                                                        setPolicyAcceptance(prev => ({ ...prev, cookie: checked }))
                                                    }
                                                    className="mt-1"
                                                />
                                                <Label htmlFor="cookie" className="text-sm text-gray-700 cursor-pointer">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openPolicyModal(e, 'cookie')}
                                                        className="text-purple-300 hover:text-purple-200 underline font-semibold"
                                                    >
                                                        Cookie Policy
                                                    </button>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-8 pt-6 border-t">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        disabled={submitting}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                                <div className={currentStep === 1 ? 'ml-auto' : ''}>
                                    {currentStep < totalSteps ? (
                                        <Button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="bg-purple-600 hover:bg-purple-700"
                                            disabled={submitting}
                                        >
                                            Continue
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Submit Application
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                        </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}