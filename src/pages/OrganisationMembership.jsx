import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPageUrl } from '@/utils';
import { Building2, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Shield, BadgeCheck, Mail, Plus, X, User, Users, CreditCard, Sparkles, Award, MapPin, Search, Pencil } from 'lucide-react';
import { ifs } from '@/api/ifsClient';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { getGoogleMapsApiKey } from '@/api/functions';

const SECTORS = [
  'Education',
  'Healthcare',
  'Social Care',
  'Local Authority',
  'Charity/Non-Profit',
  'Private Sector',
  'Other'
];

const SUBSECTORS = {
  'Education': ['Early Years', 'Primary', 'Secondary', 'Further Education', 'Higher Education', 'Special Educational Needs'],
  'Healthcare': ['NHS Trust', 'Private Hospital', 'GP Surgery', 'Mental Health Services', 'Community Health'],
  'Social Care': ['Children\'s Services', 'Adult Services', 'Residential Care', 'Domiciliary Care', 'Day Services'],
  'Local Authority': ['Children\'s Services', 'Adult Social Care', 'Education Department', 'Housing', 'Youth Services'],
  'Charity/Non-Profit': ['Children & Young People', 'Vulnerable Adults', 'Community Services', 'Advocacy', 'Support Services'],
  'Private Sector': ['Consultancy', 'Training Provider', 'Recruitment', 'Technology', 'Other Services'],
  'Other': ['Other']
};

// Tiered pricing structure
const getPricePerSeat = (numberOfSeats) => {
  if (numberOfSeats <= 2) return 20;
  if (numberOfSeats <= 5) return 16;
  if (numberOfSeats <= 8) return 15;
  if (numberOfSeats <= 10) return 14;
  return 12;
};

export default function OrganisationMembership() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgType, setOrgType] = useState('registered');
  const [numberOfSeats, setNumberOfSeats] = useState(3);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const { toast } = useToast();
  
  // Address search state
  const [addressSearch, setAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [manualAddressMode, setManualAddressMode] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapsLoadError, setMapsLoadError] = useState(false);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    sector: '',
    subsector: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    phoneNumber: ''
  });

  const [teamInvites, setTeamInvites] = useState(['']);

  useEffect(() => {
    const initPage = async () => {
      try {
        const currentUser = await ifs.auth.me();
        setUser(currentUser);

        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        if (type === 'member') {
          setOrgType('member');
        }
        
        // Load Google Maps API
        if (!window.google?.maps?.places) {
          try {
            const { data } = await getGoogleMapsApiKey();
            console.log('Google Maps API Key response:', data);
            const apiKey = data?.apiKey || data?.key;
            if (apiKey) {
              const script = document.createElement('script');
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
              script.async = true;
              script.onload = () => {
                console.log('Google Maps script loaded successfully');
                setGoogleMapsLoaded(true);
                autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
                placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'));
              };
              script.onerror = () => {
                console.error('Failed to load Google Maps script');
                setMapsLoadError(true);
              };
              document.head.appendChild(script);
            } else {
              console.error('No API key returned');
              setMapsLoadError(true);
            }
          } catch (err) {
            console.error('Failed to load Google Maps:', err);
            setMapsLoadError(true);
          }
        } else {
          console.log('Google Maps already loaded');
          setGoogleMapsLoaded(true);
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        ifs.auth.redirectToLogin(window.location.href);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'sector') {
      setFormData(prev => ({ ...prev, subsector: '' }));
    }
  };

  const addTeamInvite = () => {
    setTeamInvites([...teamInvites, '']);
  };

  const removeTeamInvite = (index) => {
    setTeamInvites(teamInvites.filter((_, i) => i !== index));
  };

  const updateTeamInvite = (index, value) => {
    const updated = [...teamInvites];
    updated[index] = value;
    setTeamInvites(updated);
  };

  // Address search functions
  const handleAddressSearch = (query) => {
    setAddressSearch(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!query || query.length < 3 || !autocompleteServiceRef.current) {
      setAddressSuggestions([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchingAddress(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'gb' },
          types: ['address']
        },
        (predictions, status) => {
          setIsSearchingAddress(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setAddressSuggestions(predictions);
          } else {
            setAddressSuggestions([]);
          }
        }
      );
    }, 300);
  };

  const handleSelectAddress = (placeId, description) => {
    setAddressSearch(description);
    setAddressSuggestions([]);
    
    if (!placesServiceRef.current) return;
    
    placesServiceRef.current.getDetails(
      { placeId, fields: ['address_components', 'formatted_address'] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const components = place.address_components;
          let streetNumber = '';
          let route = '';
          let city = '';
          let postcode = '';
          let country = 'United Kingdom';
          
          components.forEach(comp => {
            const types = comp.types;
            if (types.includes('street_number')) streetNumber = comp.long_name;
            if (types.includes('route')) route = comp.long_name;
            if (types.includes('postal_town') || types.includes('locality')) city = comp.long_name;
            if (types.includes('postal_code')) postcode = comp.long_name;
            if (types.includes('country')) country = comp.long_name;
          });
          
          const streetAddress = streetNumber ? `${streetNumber} ${route}` : route;
          
          setFormData(prev => ({
            ...prev,
            address: streetAddress,
            city: city,
            postcode: postcode,
            country: country
          }));
        }
      }
    );
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name?.trim()) {
        toast({
          title: "Organisation name required",
          description: "Please enter your organisation's name.",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.sector) {
        toast({
          title: "Sector required",
          description: "Please select your organisation's sector.",
          variant: "destructive"
        });
        return false;
      }
    }
    if (step === 2) {
      if (!formData.address?.trim() || !formData.city?.trim() || !formData.postcode?.trim()) {
        toast({
          title: "Address details required",
          description: "Please provide your organisation's full address.",
          variant: "destructive"
        });
        return false;
      }
    }
    if (step === 3 && orgType === 'member') {
      if (!numberOfSeats || numberOfSeats < 1) {
        toast({
          title: "Invalid seat count",
          description: "Please select at least 1 seat.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCheckout = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const orgData = {
        ...formData,
        primaryContactId: user.id,
        primaryContactName: user.displayName || user.full_name,
        primaryContactEmail: user.email,
        organisationType: orgType,
        status: 'active',
        isPubliclyVisible: true,
        totalSeats: numberOfSeats
      };

      const newOrg = await ifs.entities.Organisation.create(orgData);

      await ifs.auth.updateMe({
        organisationId: newOrg.id,
        organisationName: newOrg.name,
        organisationRole: 'Admin'
      });

      sessionStorage.setItem('pending_org_id', newOrg.id);
      sessionStorage.setItem('pending_org_seats', numberOfSeats.toString());

      const productionOrigin = 'https://www.ifs-safeguarding.co.uk';
      const successUrl = `${productionOrigin}${createPageUrl('OrganisationMembership')}?type=member&step=invite&org_id=${newOrg.id}`;
      const cancelUrl = `${productionOrigin}${createPageUrl('OrganisationMembership')}?type=member`;

      const { data } = await ifs.functions.invoke('createOrgMembershipCheckout', {
        organisationId: newOrg.id,
        numberOfSeats: numberOfSeats,
        billingPeriod: billingPeriod,
        successUrl,
        cancelUrl
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session.');
      }
    } catch (error) {
      console.error('Failed to create organisation:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not register organisation. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (orgType === 'registered') {
        const orgData = {
          ...formData,
          primaryContactId: user.id,
          primaryContactName: user.displayName || user.full_name,
          primaryContactEmail: user.email,
          organisationType: orgType,
          status: 'active',
          isPubliclyVisible: true
        };

        const newOrg = await ifs.entities.Organisation.create(orgData);

        await ifs.auth.updateMe({
          organisationId: newOrg.id,
          organisationName: newOrg.name,
          organisationRole: 'Admin'
        });

        const validEmails = teamInvites.filter(email => email.trim() && email.includes('@'));
        if (validEmails.length > 0) {
          try {
            await ifs.functions.invoke('inviteOrgMember', {
              organisationId: newOrg.id,
              inviteeEmails: validEmails
            });
          } catch (error) {
            console.error('Failed to send invites:', error);
          }
        }

        toast({
          title: "Organisation registered successfully!",
          description: validEmails.length > 0 
            ? `${validEmails.length} invitation(s) sent to your team.` 
            : "Welcome to the IfS community."
        });

        sessionStorage.setItem('just_joined_org', 'true');
        sessionStorage.setItem('org_name', newOrg.name);

        if (!user.onboarding_completed) {
          setTimeout(() => {
            window.location.href = createPageUrl('Onboarding') + '?intent=associate&from=org';
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.href = createPageUrl('Dashboard');
          }, 1500);
        }
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const orgId = urlParams.get('org_id') || sessionStorage.getItem('pending_org_id');
        
        const validEmails = teamInvites.filter(email => email.trim() && email.includes('@'));
        if (validEmails.length > 0 && orgId) {
          try {
            await ifs.functions.invoke('inviteOrgMember', {
              organisationId: orgId,
              inviteeEmails: validEmails
            });
            
            toast({
              title: "Team invitations sent!",
              description: `${validEmails.length} invitation(s) sent to your team members.`
            });
          } catch (error) {
            console.error('Failed to send invites:', error);
            toast({
              title: "Invites failed",
              description: "You can invite team members later from your dashboard.",
              variant: "destructive"
            });
          }
        }

        sessionStorage.removeItem('pending_org_id');
        sessionStorage.removeItem('pending_org_seats');
        sessionStorage.setItem('just_joined_org', 'true');
        
        setTimeout(() => {
          window.location.href = createPageUrl('Dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to complete registration:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not complete registration. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');
    if (step === 'invite' && orgType === 'member') {
      setCurrentStep(4);
    }
  }, [orgType]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const isRegistered = orgType === 'registered';
  const isMember = orgType === 'member';
  const totalSteps = 3;
  const needsPersonalProfile = !user.onboarding_completed;
  const pricePerSeat = getPricePerSeat(numberOfSeats);
  const monthlyPrice = numberOfSeats * pricePerSeat;
  const annualPrice = monthlyPrice * 12;
  const displayPrice = billingPeriod === 'annual' ? annualPrice : monthlyPrice;
  const totalCpdHours = numberOfSeats * (billingPeriod === 'annual' ? 12 : 1);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <div className="bg-white border-b-2 border-purple-100">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-purple-600 border-purple-600">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-white text-purple-600">
                    {Math.min(currentStep, 3)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">
                      {currentStep === 4 ? 'Team Setup' : 'Organisation Details'}
                    </div>
                    <div className="text-sm text-purple-100">
                      In Progress
                    </div>
                  </div>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />

              <div className="flex-1 max-w-md">
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-white border-gray-300">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-gray-200 text-gray-600">
                    {currentStep === 4 ? <CheckCircle2 className="w-5 h-5" /> : 2}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">
                      {currentStep === 4 ? 'Complete' : (isMember ? 'Payment' : 'Your Details')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentStep === 4 ? 'Almost Done' : 'Up Next'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {needsPersonalProfile && isRegistered && currentStep < 4 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-center text-purple-900">
                  <strong>Next:</strong> After registering your organisation, you'll complete your personal membership profile
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                    <Building2 className="w-5 h-5 text-purple-700" />
                    <span className="text-sm font-bold text-purple-900 uppercase">Step 1 of 3</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Organisation Information</h2>
                  <p className="text-gray-600">Let's start with your organisation's basic details</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your organisation's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector *
                  </label>
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.sector && SUBSECTORS[formData.sector] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-Sector
                    </label>
                    <Select value={formData.subsector} onValueChange={(value) => handleInputChange('subsector', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your sub-sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBSECTORS[formData.sector].map(subsector => (
                          <SelectItem key={subsector} value={subsector}>{subsector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.yourorganisation.org"
                    type="url"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+44 123 456 7890"
                    type="tel"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                    <MapPin className="w-5 h-5 text-purple-700" />
                    <span className="text-sm font-bold text-purple-900 uppercase">Step 2 of 3</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Organisation Address</h2>
                  <p className="text-gray-600">Where is your organisation located?</p>
                </div>

                {!manualAddressMode && googleMapsLoaded && !mapsLoadError ? (
                  <>
                    {/* Address Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search for your address
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={addressSearch}
                          onChange={(e) => handleAddressSearch(e.target.value)}
                          placeholder="Start typing your address..."
                          className="pl-10"
                        />
                        {isSearchingAddress && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                        )}
                      </div>
                      
                      {/* Suggestions dropdown */}
                      {addressSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {addressSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              type="button"
                              onClick={() => handleSelectAddress(suggestion.place_id, suggestion.description)}
                              className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                            >
                              <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{suggestion.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected address display */}
                    {formData.address && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-purple-900">{formData.address}</p>
                              <p className="text-sm text-purple-700">{formData.city}, {formData.postcode}</p>
                              <p className="text-sm text-purple-700">{formData.country}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, address: '', city: '', postcode: '', country: 'United Kingdom' }));
                              setAddressSearch('');
                            }}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualAddressMode(true)}
                      className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-2"
                    >
                      <Pencil className="w-3 h-3" />
                      Enter address manually
                    </button>
                  </>
                ) : (
                  <>
                    {/* Manual address input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postcode *
                        </label>
                        <Input
                          value={formData.postcode}
                          onChange={(e) => handleInputChange('postcode', e.target.value)}
                          placeholder="Postcode"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <Input
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      />
                    </div>

                    {googleMapsLoaded && !mapsLoadError && (
                      <button
                        type="button"
                        onClick={() => setManualAddressMode(false)}
                        className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-2"
                      >
                        <Search className="w-3 h-3" />
                        Search for address instead
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && isMember && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                    <CreditCard className="w-5 h-5 text-purple-700" />
                    <span className="text-sm font-bold text-purple-900 uppercase">Step 3 of 3</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Membership Seats</h2>
                  <p className="text-gray-600">How many Full Membership seats do you need?</p>
                </div>

                {/* BILLING PERIOD SELECTOR - PROFESSIONAL DESIGN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Billing Period
                  </label>
                  <div className="inline-flex bg-gray-100 rounded-lg p-1 w-full">
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('monthly')}
                      className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all ${
                        billingPeriod === 'monthly'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="text-sm">Monthly</div>
                      <div className="text-xs mt-1 font-normal">
                        £{monthlyPrice}/month
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingPeriod('annual')}
                      className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all relative ${
                        billingPeriod === 'annual'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="text-sm">Annual</div>
                      <div className="text-xs mt-1 font-normal">
                        £{annualPrice}/year
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        SAVE
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                  <div className="flex items-start gap-4 mb-4">
                    <Users className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">What's Included Per Seat</h3>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>✓ Full Member benefits and designation</li>
                        <li>✓ {billingPeriod === 'annual' ? '12 CPD hours per year' : '1 CPD hour per month'}</li>
                        <li>✓ 10% discount on all training and supervision</li>
                        <li>✓ Access to all masterclass recordings</li>
                        <li>✓ Voting rights and governance participation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Number of Seats *
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNumberOfSeats(Math.max(1, numberOfSeats - 1))}
                      disabled={numberOfSeats <= 1}
                    >
                      <span className="text-xl">−</span>
                    </Button>
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="1"
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center text-2xl font-bold"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNumberOfSeats(numberOfSeats + 1)}
                    >
                      <span className="text-xl">+</span>
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Price per seat/{billingPeriod === 'annual' ? 'year' : 'month'}:</span>
                    <span className="font-semibold">£{billingPeriod === 'annual' ? (pricePerSeat * 12) : pricePerSeat}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">CPD hours per seat/{billingPeriod === 'annual' ? 'year' : 'month'}:</span>
                    <span className="font-semibold">{billingPeriod === 'annual' ? '12' : '1'} hours</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Number of seats:</span>
                    <span className="font-semibold">×{numberOfSeats}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold">Total per {billingPeriod === 'annual' ? 'year' : 'month'}:</span>
                      <span className="text-2xl font-bold text-purple-600">£{displayPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total CPD hours allocation:</span>
                      <span className="text-lg font-bold text-green-600">{totalCpdHours} hours/{billingPeriod === 'annual' ? 'year' : 'month'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {billingPeriod === 'annual' 
                        ? `£${monthlyPrice}/month • Billed annually • Cancel anytime` 
                        : 'Billed monthly • Cancel anytime'
                      }
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-900">
                    <strong>Next:</strong> After payment, you'll be able to invite team members and assign them to seats.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && isRegistered && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                    <Mail className="w-5 h-5 text-purple-700" />
                    <span className="text-sm font-bold text-purple-900 uppercase">Step 3 of 3 - Optional</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Invite Your Team</h2>
                  <p className="text-gray-600">Add team members who will join your organisation</p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold mb-1 text-blue-900">Team Invitations</h3>
                      <p className="text-sm text-blue-800">
                        Invite colleagues to join as Associate Members under your organisation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Team Member Email Addresses (Optional)
                  </label>
                  {teamInvites.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateTeamInvite(index, e.target.value)}
                        placeholder="colleague@organisation.org"
                        className="flex-1"
                      />
                      {teamInvites.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTeamInvite(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTeamInvite}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Team Member
                  </Button>
                </div>

                {needsPersonalProfile && (
                  <div className="bg-purple-50 rounded-lg p-5 border-2 border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-purple-900 mb-2">Next: Complete Your Personal Profile</p>
                        <p className="text-sm text-purple-800">
                          After submitting, you'll complete your Associate Membership profile to access all member benefits.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> You can skip this step and invite team members later from your dashboard.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && isMember && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-700" />
                    <span className="text-sm font-bold text-green-900 uppercase">Payment Complete</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Invite Your Team</h2>
                  <p className="text-gray-600">Add team members and assign them to your Full Membership seats</p>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold mb-1 text-purple-900">Team Invitations</h3>
                      <p className="text-sm text-purple-800">
                        Invite DSLs and DDSLs to receive Full Membership seats. They will be assigned to your paid seats.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Team Member Email Addresses (Optional)
                  </label>
                  {teamInvites.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateTeamInvite(index, e.target.value)}
                        placeholder="colleague@organisation.org"
                        className="flex-1"
                      />
                      {teamInvites.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTeamInvite(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTeamInvite}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Team Member
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> You can skip this step and invite team members later from your dashboard.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && currentStep !== 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className={currentStep === 1 || currentStep === 4 ? 'ml-auto' : ''}>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={isRegistered ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : currentStep === 3 && isMember ? (
                  <Button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={isRegistered ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : currentStep === 4 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {needsPersonalProfile ? 'Continue to Your Profile' : 'Complete Registration'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}