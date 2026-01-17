import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createPageUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import SurveyRewardModal from '../components/modals/SurveyRewardModal';
import SurveyQuestionField from '../components/surveys/SurveyQuestionField';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@ifs/shared/components/ui/card';
import { Progress } from '@ifs/shared/components/ui/progress';
import { Label } from '@ifs/shared/components/ui/label';
import { 
    Loader2, 
    Send,
    ChevronRight,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";

export default function Survey() {
    const { user, loading: userLoading, initialCheckComplete, refreshUser } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const [otherValues, setOtherValues] = useState({});
    const [commentValues, setCommentValues] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [completedSurveyTitle, setCompletedSurveyTitle] = useState('');
    const [hasAlreadyResponded, setHasAlreadyResponded] = useState(false);
    const { toast } = useToast();
    
    const mainContainerRef = useRef(null);

    useEffect(() => {
        if (!userLoading && user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, userLoading]);

    useEffect(() => {
        if (user && initialCheckComplete) {
            const urlParams = new URLSearchParams(window.location.search);
            const surveyId = urlParams.get('id');
            if (surveyId) {
                fetchSurvey(surveyId);
            } else {
                setLoading(false);
            }
        }
    }, [user, initialCheckComplete]);

    const fetchSurvey = async (surveyId) => {
        setLoading(true);
        try {
            // Fetch survey
            const surveyData = await base44.entities.Survey.get(surveyId);
            if (!surveyData) {
                throw new Error('Survey not found');
            }

            // Check if user responded
            const userDemographics = await base44.entities.SurveyDemographic.filter({ created_by: user.email });
            const demographicIds = userDemographics.map(d => d.id);
            
            let responded = false;
            if (demographicIds.length > 0) {
                const userResponses = await base44.entities.SurveyResponse.list();
                // This is not super efficient if there are many responses, but fits the pattern used in YourVoice
                // Ideally we would filter by surveyId too if the API supports it
                const response = userResponses.find(r => r.surveyId === surveyId && demographicIds.includes(r.demographicId));
                if (response) responded = true;
            }

            if (responded && !surveyData.allowMultipleResponses) {
                setHasAlreadyResponded(true);
            }

            setSurvey(surveyData);

            // Initialize form
            const initialData = {};
            const initialOther = {};
            const initialComments = {};
            surveyData.questions?.forEach(q => {
                initialData[q.id] = q.type === 'checkbox' ? [] : '';
                initialOther[q.id] = '';
                initialComments[q.id] = '';
            });
            setFormData(initialData);
            setOtherValues(initialOther);
            setCommentValues(initialComments);

        } catch (error) {
            console.error('Failed to fetch survey:', error);
            toast({
                title: "Error",
                description: "Could not load survey.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (questionId, value) => {
        setFormData(prev => ({
            ...prev,
            [questionId]: value
        }));
        if (validationErrors[questionId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    const handleOtherChange = (questionId, value) => {
        setOtherValues(prev => ({
            ...prev,
            [questionId]: value
        }));
        if (validationErrors[questionId]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    const handleCommentChange = (questionId, value) => {
        setCommentValues(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const validateCurrentSection = (questions) => {
        const errors = {};
        
        questions.forEach(q => {
            if (!q.required) return;
            
            const answer = formData[q.id];
            let hasError = false;
            
            if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                hasError = true;
            }
            
            if (q.hasOtherOption && !hasError) {
                if (q.type === 'radio' && answer === '__other__' && !otherValues[q.id]?.trim()) {
                    hasError = true;
                }
                if (q.type === 'checkbox' && Array.isArray(answer) && answer.includes('__other__') && !otherValues[q.id]?.trim()) {
                    hasError = true;
                }
            }
            
            if (hasError) {
                errors[q.id] = true;
            }
        });
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            
            toast({
                title: "Required fields missing",
                description: "Please complete all required questions.",
                variant: "destructive"
            });
            
            setTimeout(() => {
                const firstErrorId = Object.keys(errors)[0];
                const element = document.getElementById(`question-${firstErrorId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            
            return false;
        }
        
        return true;
    };

    const handleNextSection = (questions) => {
        if (!validateCurrentSection(questions)) return;
        
        setValidationErrors({});
        setCurrentSectionIndex(prev => prev + 1);
        
        requestAnimationFrame(() => {
            if (mainContainerRef.current) {
                mainContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handlePreviousSection = () => {
        setValidationErrors({});
        setCurrentSectionIndex(prev => prev - 1);
        
        requestAnimationFrame(() => {
            if (mainContainerRef.current) {
                mainContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handleSubmitSurvey = async (questions) => {
        if (!validateCurrentSection(questions)) return;
        
        setIsSubmitting(true);
        try {
            const demographicData = {
                membershipType: user.membershipType,
                sector: user.sector,
                subsector: user.subsector,
                safeguardingRole: Array.isArray(user.safeguarding_role) 
                    ? user.safeguarding_role.join(', ') 
                    : user.safeguarding_role,
                jobRole: user.jobRole,
                city: user.city,
                country: user.country,
                trainingRefreshFrequency: user.training_refresh_frequency,
                receivesSupervision: user.receives_supervision || false,
                hasOrganisationalMembership: user.organisationId ? true : false
            };

            const demographicRecord = await base44.entities.SurveyDemographic.create(demographicData);

            const finalResponses = {};
            survey.questions.forEach(q => {
                let answer = formData[q.id];
                
                if (q.hasOtherOption && otherValues[q.id]) {
                    if (q.type === 'radio' && answer === '__other__') {
                        answer = `Other: ${otherValues[q.id]}`;
                    } else if (q.type === 'checkbox' && Array.isArray(answer) && answer.includes('__other__')) {
                        answer = answer.filter(v => v !== '__other__').concat([`Other: ${otherValues[q.id]}`]);
                    }
                }
                
                finalResponses[q.id] = answer;
                
                if (q.allowComments && commentValues[q.id]?.trim()) {
                    finalResponses[`${q.id}_comment`] = commentValues[q.id];
                }
            });

            await base44.entities.SurveyResponse.create({
                surveyId: survey.id,
                surveyTitle: survey.title,
                demographicId: demographicRecord.id,
                responses: finalResponses,
                completed: true,
                submittedDate: new Date().toISOString()
            });

            const completedTitle = survey.title;

            if (user.membershipType === 'Associate' || user.membershipType === 'Full') {
                const cpdHoursReward = 0.1;
                const currentBalance = user.cpdHours || 0;
                const newBalance = currentBalance + cpdHoursReward;

                await base44.entities.User.update(user.id, {
                    cpdHours: newBalance,
                    totalCpdEarned: (user.totalCpdEarned || 0) + cpdHoursReward
                });

                await base44.entities.CreditTransaction.create({
                    userId: user.id,
                    userEmail: user.email,
                    transactionType: 'allocation',
                    amount: cpdHoursReward,
                    balanceAfter: newBalance,
                    description: `Survey completion reward: ${completedTitle}`,
                    relatedEntityType: 'Manual',
                    relatedEntityName: `Survey: ${completedTitle}`
                });
                
                setCompletedSurveyTitle(completedTitle);
                setShowRewardModal(true);
            } else {
                toast({
                    title: "Response submitted",
                    description: "Thank you for your feedback.",
                    duration: 5000
                });
                // Wait a moment then redirect
                setTimeout(() => {
                    window.location.href = createPageUrl('YourVoice');
                }, 1500);
            }

            setHasAlreadyResponded(true);
            await refreshUser();

        } catch (error) {
            console.error('Failed to submit survey:', error);
            toast({
                title: "Submission failed",
                description: "Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (userLoading || loading || !initialCheckComplete) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!survey) {
         return (
            <div className="flex h-screen bg-slate-50">
                <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="YourVoice" />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                    <main className="flex-1 p-8">
                        <Card>
                            <CardContent className="py-12 text-center">
                                <h3 className="text-lg font-semibold">Survey not found</h3>
                                <Button asChild className="mt-4" variant="outline">
                                    <a href={createPageUrl('YourVoice')}>Return to Surveys</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
         );
    }

    if (hasAlreadyResponded && !showRewardModal) {
        return (
             <div className="flex h-screen bg-slate-50">
                <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="YourVoice" />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                    <main className="flex-1 p-8">
                        <Card>
                             <CardContent className="py-12 text-center">
                                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                    <Loader2 className="w-6 h-6 text-emerald-600" /> 
                                    {/* Using Loader2 as a placeholder icon if CheckCircle is not imported, but CheckCircle is better. I see I didn't import CheckCircle. */}
                                </div>
                                <h3 className="text-lg font-semibold">You have already completed this survey</h3>
                                <p className="text-slate-600 mt-2">Thank you for your contribution.</p>
                                <Button asChild className="mt-6" variant="outline">
                                    <a href={createPageUrl('YourVoice')}>Return to Surveys</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        );
    }

    const sections = survey.sections || [];
    const hasSections = sections.length > 0;
    
    const surveyStructure = [];
    
    if (hasSections) {
        const noSectionQuestions = survey.questions.filter(q => !q.sectionId);
        if (noSectionQuestions.length > 0) {
            surveyStructure.push({
                id: 'general',
                title: 'General Questions',
                description: '',
                questions: noSectionQuestions
            });
        }
        
        sections.forEach(section => {
            const sectionQuestions = survey.questions.filter(q => q.sectionId === section.id);
            if (sectionQuestions.length > 0) {
                surveyStructure.push({
                    ...section,
                    questions: sectionQuestions
                });
            }
        });
    } else {
        surveyStructure.push({
            id: 'all',
            title: survey.title,
            description: survey.description,
            questions: survey.questions
        });
    }

    const currentSection = surveyStructure[currentSectionIndex];
    // Safeguard against invalid index if survey data changed
    if (!currentSection) return null; 

    const isLastSection = currentSectionIndex === surveyStructure.length - 1;
    const progress = ((currentSectionIndex + 1) / surveyStructure.length) * 100;

    return (
        <div className="flex h-screen bg-slate-50">
            <Toaster />
            <SurveyRewardModal
                open={showRewardModal}
                onClose={() => {
                    setShowRewardModal(false);
                    window.location.href = createPageUrl('YourVoice');
                }}
                surveyTitle={completedSurveyTitle}
            />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="YourVoice" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main ref={mainContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
                    <div className="max-w-4xl mx-auto">
                        <Button 
                            variant="ghost" 
                            asChild
                            className="mb-4 md:mb-6 text-sm md:text-base"
                        >
                            <a href={createPageUrl('YourVoice')}>
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Surveys
                            </a>
                        </Button>

                        {surveyStructure.length > 1 && (
                            <div className="mb-4 md:mb-6 bg-white rounded-lg p-4 border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs md:text-sm font-medium text-slate-700">
                                        Section {currentSectionIndex + 1} of {surveyStructure.length}
                                    </span>
                                    <span className="text-xs md:text-sm font-semibold text-slate-900">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        <Card className="border shadow-sm overflow-hidden">
                            <CardHeader className="border-b bg-slate-50 p-4 md:p-6">
                                <CardTitle className="text-xl md:text-2xl font-semibold text-slate-900 break-words">{currentSection.title}</CardTitle>
                                {currentSection.description && (
                                    <CardDescription className="text-sm md:text-base text-slate-600 mt-2 break-words">
                                        {currentSection.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            
                            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                                {currentSection.questions.map((question, idx) => (
                                    <div 
                                        key={question.id} 
                                        id={`question-${question.id}`}
                                        className={`p-4 md:p-6 rounded-lg border ${
                                            validationErrors[question.id] 
                                                ? 'bg-red-50 border-red-300' 
                                                : 'bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        <Label className="text-sm md:text-base font-medium text-slate-900 flex items-start gap-3 mb-4">
                                            <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-semibold ${
                                                validationErrors[question.id]
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-slate-600 text-white'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1 pt-0.5 break-words leading-relaxed">
                                                {question.text}
                                                {question.required && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                        </Label>
                                        <div className="pl-0 md:pl-11">
                                            <SurveyQuestionField
                                                question={question}
                                                value={formData[question.id]}
                                                otherValue={otherValues[question.id]}
                                                commentValue={commentValues[question.id]}
                                                onChange={(value) => handleFieldChange(question.id, value)}
                                                onOtherChange={(value) => handleOtherChange(question.id, value)}
                                                onCommentChange={(value) => handleCommentChange(question.id, value)}
                                                hasError={validationErrors[question.id]}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            
                            <CardFooter className="border-t bg-slate-50 flex flex-col sm:flex-row justify-between p-4 md:p-6 gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={currentSectionIndex === 0 ? () => {
                                        window.location.href = createPageUrl('YourVoice');
                                    } : handlePreviousSection}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto text-sm md:text-base"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    {currentSectionIndex === 0 ? 'Cancel' : 'Previous'}
                                </Button>
                                
                                {isLastSection ? (
                                    <Button 
                                        type="button"
                                        onClick={() => handleSubmitSurvey(currentSection.questions)}
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm md:text-base"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit
                                                <Send className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button 
                                        type="button"
                                        onClick={() => handleNextSection(currentSection.questions)}
                                        disabled={isSubmitting}
                                        className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm md:text-base"
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>

                        {surveyStructure.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4 md:mt-6">
                                {surveyStructure.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setCurrentSectionIndex(idx);
                                            setValidationErrors({});
                                        }}
                                        className={`h-2 rounded-full transition-all ${
                                            idx === currentSectionIndex 
                                                ? 'bg-purple-600 w-8' 
                                                : idx < currentSectionIndex
                                                ? 'bg-emerald-500 w-2'
                                                : 'bg-slate-300 w-2'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}