import React, { useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { User } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { Checkbox } from '@ifs/shared/components/ui/checkbox';
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, User as UserIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@ifs/shared/components/ui/card';
import { sendEmail } from '@ifs/shared/api/functions';
import { createCheckout } from '@ifs/shared/api/functions';
import { generateCertificate } from '@ifs/shared/api/functions';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { customLoginWithRedirect } from '../components/utils/auth';
import { addToMailerLite } from '@ifs/shared/api/functions';
import PolicyModal from '../components/modals/PolicyModal';
import { getCitySuggestions } from '@ifs/shared/api/functions';
import { getCountries } from '@ifs/shared/api/functions';
import { OrgInvite } from '@ifs/shared/api/entities';
import { useLocation } from 'react-router-dom';
import { acceptOrgInvite } from '@ifs/shared/api/functions';
import AuthShell from '@ifs/shared/components/auth/AuthShell';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ifs/shared/components/ui/form';

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

        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        // Organisation name can be pre-filled from invite, check for that too
        const orgName = inviteOrgName || (authUser && authUser.organisationName) || formData.organisationName;

        const errors = {};
        if (!orgName.trim()) {
            form.setError('organisationName', { type: 'manual', message: 'Organisation name is required' });
            errors.organisationName = true;
        }
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        const errors = {};
        if (!formData.jobRole.trim()) {
            form.setError('jobRole', { type: 'manual', message: 'Job role is required' });
            errors.jobRole = true;
        }
        if (!formData.sector) {
            form.setError('sector', { type: 'manual', message: 'Sector is required' });
            errors.sector = true;
        }
        if (formData.sector === 'Other' && !formData.other_sector.trim()) {
            form.setError('other_sector', { type: 'manual', message: 'Please specify your sector' });
            errors.other_sector = true;
        }
        return Object.keys(errors).length === 0;
    };

    const validateStep4 = () => {
        const errors = {};
        if (!formData.safeguarding_role) {
            form.setError('safeguarding_role', { type: 'manual', message: 'Safeguarding role is required' });
            errors.safeguarding_role = true;
        }
        if (formData.subsector === 'Other' && !formData.other_sub_sector.trim()) {
            form.setError('other_sub_sector', { type: 'manual', message: 'Please specify your sub-sector' });
            errors.other_sub_sector = true;
        }
        return Object.keys(errors).length === 0;
    };

    const validateStep5 = () => {
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
        } else if (currentStep === 4) {
            isValid = validateStep4();
        } else if (currentStep === 5) {
            isValid = validateStep5();
        }

        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep === 5) {
             if (!validateStep1()) { setCurrentStep(1); return; }
             if (!validateStep2()) { setCurrentStep(2); return; }
             if (!validateStep3()) { setCurrentStep(3); return; }
             if (!validateStep4()) { setCurrentStep(4); return; }
             if (!validateStep5()) { return; }
        }
        if (!authUser) {
            toast({ title: "Authentication Error", description: "User not logged in. Please refresh and try again.", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        toast({ title: "Finalizing your application..." });

        try {
            const resolvedOrganisationName =
                inviteOrgName || authUser?.organisationName || formData.organisationName;
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
                organisation: resolvedOrganisationName,
                other_subsector: formData.other_sub_sector,
                completed_training: Array.isArray(formData.completed_training)
                    ? formData.completed_training.join(', ')
                    : formData.completed_training,
                attended_training_topics: Array.isArray(formData.attended_training_topics)
                    ? formData.attended_training_topics.join(', ')
                    : formData.attended_training_topics,
                membershipType: isAssociate ? 'Associate' : undefined, // Only set for Associates
                membershipStatus: isAssociate ? 'active' : undefined, // Only set for Associates
                needsApplicationProcessing: isAssociate ? true : false, // Only for Associates
                onboarding_completed: false, // Will be set to true in ApplicationProcessing
            };
            delete dataToSubmit.organisationName;
            delete dataToSubmit.other_sub_sector;
            delete dataToSubmit.membershipTier;

            console.log('[Onboarding] Updating user profile:', { 
                membershipType: membershipTypeForProfile, 
                needsApplicationProcessing: dataToSubmit.needsApplicationProcessing,
                isFull: isFull 
            });
            await updateUserProfile(dataToSubmit);

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
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
            </div>
        );
    }

    const totalSteps = 5;
    const steps = [
        { number: 1, title: "Personal Details" },
        { number: 2, title: "Organisation" },
        { number: 3, title: "Role" },
        { number: 4, title: "Safeguarding" },
        { number: 5, title: "Review" }
    ];

    if (redirectingToCheckout) {
        return (
            <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Redirecting to secure checkout...</h2>
                    <p className="text-slate-200">Please wait while we prepare your payment</p>
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
            <AuthShell
                title=""
                subtitle=""
                maxWidthClass="max-w-3xl"
                pageClassName="h-screen"
                panelClassName="min-h-[calc(100vh-220px)] flex flex-col"
            >
                {/* Multi-step Progress Bar */}
                <div className="mb-8 flex items-center justify-between px-4">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 border-2 transition-all shadow-sm ${
                                    currentStep > step.number
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : currentStep === step.number
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <div className="mt-2 text-center hidden sm:block">
                                    <div className={`text-xs font-medium ${
                                        currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                        {step.title}
                                    </div>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-1 flex-1 mx-3 transition-all rounded-full ${
                                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Current Step Title for Mobile */}
                <div className="sm:hidden text-center mb-6">
                    <div className="font-semibold text-gray-900 text-sm">
                        {steps[currentStep - 1].title}
                    </div>
                </div>

                <Form {...form}>
                <form
                    onSubmit={handleSubmit}
                    className={currentStep === 5 ? "space-y-8 flex-1 flex flex-col" : "space-y-8"}
                >
                            {/* Step 1: Personal Details */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-1 pb-4 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                                        <p className="text-sm text-gray-600">Let's start with your basic details</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700">First Name <span className="label-required">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.firstName}
                                                            onChange={(e) => {
                                                                handleInputChange('firstName', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('firstName');
                                                            }}
                                                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                    <FormLabel className="text-slate-700">Last Name <span className="label-required">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={formData.lastName}
                                                            onChange={(e) => {
                                                                handleInputChange('lastName', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('lastName');
                                                            }}
                                                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                <FormLabel className="text-slate-700">Phone Number <span className="label-required">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => {
                                                            handleInputChange('phoneNumber', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('phoneNumber');
                                                        }}
                                                        className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="+44 7000 000000"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 2: Organisation */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-1 pb-4 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900">Organisation</h3>
                                        <p className="text-sm text-gray-600">Share your organisation details</p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="organisationName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Organisation Name <span className="label-required">*</span></FormLabel>
                                                <FormControl>
                                                    {inviteOrgName || (authUser && authUser.organisationName) ? (
                                                        <Input
                                                            value={inviteOrgName || authUser.organisationName}
                                                            disabled
                                                            className="h-11 bg-slate-100 text-slate-900 cursor-not-allowed border-slate-200"
                                                        />
                                                    ) : (
                                                        <Input
                                                            {...field}
                                                            value={formData.organisationName}
                                                            onChange={(e) => {
                                                                handleInputChange('organisationName', e.target.value);
                                                                field.onChange(e);
                                                                form.clearErrors('organisationName');
                                                            }}
                                                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    )}
                                                </FormControl>
                                                {inviteOrgName || (authUser && authUser.organisationName) ? (
                                                    <p className="text-xs text-slate-600 mt-1">Organisation set via invite</p>
                                                ) : null}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="text-slate-700">Country</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                className="h-11"
                                                placeholder="Enter your country"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-slate-700">City</Label>
                                            <Input
                                                id="onboarding-city-input"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Start typing your city..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Role */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-1 pb-4 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900">Role</h3>
                                        <p className="text-sm text-gray-600">Tell us about your current role</p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="jobRole"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Job Role <span className="label-required">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.jobRole}
                                                        onChange={(e) => {
                                                            handleInputChange('jobRole', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('jobRole');
                                                        }}
                                                        className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="e.g., Designated Safeguarding Lead"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sector"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Sector <span className="label-required">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.sector}
                                                        onChange={(e) => {
                                                            handleInputChange('sector', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('sector');
                                                        }}
                                                        className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                    <FormLabel className="text-slate-700">Please Specify Sector <span className="label-required">*</span></FormLabel>
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
                                                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Step 4: Safeguarding */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="space-y-1 pb-4 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900">Safeguarding</h3>
                                        <p className="text-sm text-gray-600">Share your safeguarding focus</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subsector" className="text-slate-700">Sub-sector</Label>
                                        <Input
                                            id="subsector"
                                            value={formData.subsector}
                                            onChange={(e) => handleInputChange('subsector', e.target.value)}
                                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your sub-sector"
                                        />
                                    </div>
                                    {formData.subsector === 'Other' && (
                                        <FormField
                                            control={form.control}
                                            name="other_sub_sector"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700">Please Specify Sub-sector <span className="label-required">*</span></FormLabel>
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
                                                            className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                <FormLabel className="text-slate-700">What is your current role in safeguarding? <span className="label-required">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formData.safeguarding_role}
                                                        onChange={(e) => {
                                                            handleInputChange('safeguarding_role', e.target.value);
                                                            field.onChange(e);
                                                            form.clearErrors('safeguarding_role');
                                                        }}
                                                        className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Enter your safeguarding role"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                                <div className="space-y-6 flex-1">
                                    <div className="space-y-1 pb-4 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-900">Review</h3>
                                        <p className="text-sm text-gray-600">Please review your application and accept our policies</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-base font-bold text-gray-900 mb-3">Personal Information</h4>
                                            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                                                <div><span className="font-medium text-slate-700">Name:</span> {formData.firstName} {formData.lastName}</div>
                                                <div><span className="font-medium text-slate-700">Phone:</span> {formData.phoneNumber}</div>
                                                <div><span className="font-medium text-slate-700">Organisation:</span> {formData.organisationName}</div>
                                                <div><span className="font-medium text-slate-700">City:</span> {formData.city}</div>
                                                <div><span className="font-medium text-slate-700">Country:</span> {formData.country}</div>
                                                <div className="md:col-span-2"><span className="font-medium text-slate-700">Job Role:</span> {formData.jobRole}</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-base font-bold text-gray-900 mb-3">Professional Background</h4>
                                            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                                                <div><span className="font-medium text-gray-700">Sector:</span> {formData.sector === 'Other' ? `Other: ${formData.other_sector}` : formData.sector}</div>
                                                {formData.subsector && <div><span className="font-medium text-gray-700">Sub-sector:</span> {formData.subsector === 'Other' ? `Other: ${formData.other_sub_sector}` : formData.subsector}</div>}
                                                <div className="md:col-span-2"><span className="font-medium text-gray-700">Safeguarding Role:</span> {formData.safeguarding_role}</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-base font-bold text-gray-900 mb-3">Training & Development</h4>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div><span className="font-medium text-gray-700">Completed Training:</span> {(formData.completed_training || []).join(', ') || 'None selected'}</div>
                                                <div><span className="font-medium text-gray-700">Had Induction:</span> {formData.had_induction ? 'Yes' : 'No'}</div>
                                                <div><span className="font-medium text-gray-700">Training Refresh Frequency:</span> {formData.training_refresh_frequency || 'Not specified'}</div>
                                                <div><span className="font-medium text-gray-700">Attended Training Topics:</span> {(formData.attended_training_topics || []).join(', ') || 'None selected'}</div>
                                                {formData.other_training_details && <div><span className="font-medium text-gray-700">Other Training Details:</span> {formData.other_training_details}</div>}
                                                <div><span className="font-medium text-gray-700">Receives Supervision:</span> {formData.receives_supervision ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="text-base font-bold text-gray-900 mb-3">Policy Acceptance *</h4>
                                        <p className="text-xs text-slate-600 mb-4">
                                            Please review and accept our policies to continue
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="terms"
                                                    checked={policyAcceptance.terms}
                                                    onCheckedChange={(checked) =>
                                                        setPolicyAcceptance(prev => ({ ...prev, terms: checked }))
                                                    }
                                                    className="mt-0.5"
                                                />
                                                <Label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openPolicyModal(e, 'terms')}
                                                        className="text-slate-900 hover:text-slate-700 underline font-medium underline-offset-4"
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
                                                    className="mt-0.5"
                                                />
                                                <Label htmlFor="privacy" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openPolicyModal(e, 'privacy')}
                                                        className="text-slate-900 hover:text-slate-700 underline font-medium underline-offset-4"
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
                                                    className="mt-0.5"
                                                />
                                                <Label htmlFor="cookie" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                                                    I accept the{' '}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openPolicyModal(e, 'cookie')}
                                                        className="text-slate-900 hover:text-slate-700 underline font-medium underline-offset-4"
                                                    >
                                                        Cookie Policy
                                                    </button>
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-8 pt-6">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        disabled={submitting}
                                        className="h-12 px-6 border-gray-300 hover:bg-gray-50 font-medium rounded-lg"
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
                                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
                                            disabled={submitting}
                                        >
                                            Continue
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
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
            </AuthShell>
        </>
    );
}
