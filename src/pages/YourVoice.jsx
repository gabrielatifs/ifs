import React, { useState, useEffect } from 'react';
import { ifs } from '@/api/ifsClient';
import { useUser } from '../components/providers/UserProvider';
import { createPageUrl } from '@/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Loader2, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const SurveyCard = ({ survey, hasResponded, isPastDeadline }) => {
    const isTimeLimited = !survey.isAlwaysAvailable && survey.endDate;
    const daysRemaining = isTimeLimited 
        ? Math.ceil((new Date(survey.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const handleTakeSurvey = () => {
        window.location.href = `${createPageUrl('Survey')}?id=${survey.id}`;
    };

    return (
        <Card className={`group border transition-all duration-200 ${
            hasResponded 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : 'hover:shadow-md hover:border-slate-300'
        }`}>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <CardTitle className="text-base md:text-lg font-semibold text-slate-900 flex items-start gap-2">
                        <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{survey.title}</span>
                    </CardTitle>
                    {hasResponded && (
                        <Badge className="bg-emerald-600 text-xs flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                        </Badge>
                    )}
                </div>
                {survey.description && (
                    <CardDescription className="text-xs md:text-sm line-clamp-2 text-slate-600 ml-6 md:ml-7">
                        {survey.description}
                    </CardDescription>
                )}
                
                <div className="flex flex-wrap gap-2 ml-6 md:ml-7 mt-3">
                    {survey.isAlwaysAvailable ? (
                        <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Open
                        </Badge>
                    ) : (
                        <>
                            {isTimeLimited && !isPastDeadline && (
                                <Badge variant="outline" className={`text-xs ${
                                    daysRemaining <= 3 ? 'border-red-300 text-red-700' : 'border-amber-300 text-amber-700'
                                }`}>
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {daysRemaining === 0 ? 'Closes today' : `${daysRemaining}d left`}
                                </Badge>
                            )}
                        </>
                    )}
                    <Badge variant="outline" className="text-xs">
                        {survey.questions?.length || 0} question{survey.questions?.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardFooter className="border-t bg-slate-50/50 pt-4">
                {isPastDeadline ? (
                    <div className="w-full text-center py-2 text-xs md:text-sm text-slate-500">
                        Survey closed
                    </div>
                ) : hasResponded && !survey.allowMultipleResponses ? (
                    <div className="w-full text-center py-2">
                        <p className="text-xs md:text-sm font-medium text-emerald-700">Response received</p>
                        <p className="text-xs text-slate-600">Thank you for your input</p>
                    </div>
                ) : (
                    <Button 
                        onClick={handleTakeSurvey} 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base"
                    >
                        {hasResponded ? 'Submit another response' : 'Begin survey'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default function YourVoice() {
    const { user, loading: userLoading, initialCheckComplete } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [surveys, setSurveys] = useState([]);
    const [userResponseSurveyIds, setUserResponseSurveyIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!userLoading && user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, userLoading]);

    useEffect(() => {
        if (user) {
            fetchSurveys();
        }
    }, [user]);

    const fetchSurveys = async () => {
        setLoading(true);
        try {
            const allSurveys = await ifs.entities.Survey.filter({ status: 'active' }, '-created_date');
            
            const userDemographics = await ifs.entities.SurveyDemographic.filter({ created_by: user.email });
            const demographicIds = userDemographics.map(d => d.id);
            
            let respondedSurveyIds = new Set();
            if (demographicIds.length > 0) {
                const userResponses = await ifs.entities.SurveyResponse.list();
                const filteredResponses = userResponses.filter(r => demographicIds.includes(r.demographicId));
                respondedSurveyIds = new Set(filteredResponses.map(r => r.surveyId));
            }

            const now = new Date();
            
            const availableSurveys = allSurveys.filter(survey => {
                if (survey.targetAudience !== 'all' && survey.targetAudience !== user.membershipType) {
                    return false;
                }
                
                if (!survey.isAlwaysAvailable) {
                    if (survey.startDate && new Date(survey.startDate) > now) {
                        return false;
                    }
                    if (survey.endDate && new Date(survey.endDate) < now) {
                        return false;
                    }
                }
                
                return true;
            });

            setSurveys(availableSurveys);
            setUserResponseSurveyIds(respondedSurveyIds);
        } catch (error) {
            console.error('Failed to fetch surveys:', error);
            toast({
                title: "Error",
                description: "Could not load surveys.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
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

    const hasUserResponded = (surveyId) => {
        return userResponseSurveyIds.has(surveyId);
    };

    const isPastDeadline = (survey) => {
        if (survey.isAlwaysAvailable) return false;
        if (!survey.endDate) return false;
        return new Date(survey.endDate) < new Date();
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="YourVoice" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
                    <div className="max-w-6xl mx-auto">
                        {/* HERO SECTION */}
                        <div className="mb-6 md:mb-8 bg-white border rounded-lg p-6 md:p-8">
                            <div className="grid lg:grid-cols-[1fr,240px] gap-6 md:gap-8">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">Member Survey Programme</h1>
                                    <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-4 md:mb-6">
                                        Your professional feedback informs our policy development, sector advocacy, and service improvements. All responses are confidential and contribute to evidence-based decision making.
                                    </p>
                                    <ul className="space-y-2 text-xs md:text-sm text-slate-600">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                                            <span>Responses are anonymous and secure</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                                            <span>Data used for sector research and policy</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></div>
                                            <span>Earn 0.1 CPD hours per completed survey</span>
                                        </li>
                                    </ul>
                                </div>
                                
                                <div className="flex items-center justify-center">
                                    <div className="text-center p-5 md:p-6 bg-slate-50 rounded-lg border w-full">
                                        <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-1">0.1</div>
                                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 md:mb-3">CPD Hours</div>
                                        <div className="text-xs text-slate-500 mb-2 md:mb-3">Per survey completed</div>
                                        <div className="pt-2 md:pt-3 border-t">
                                            <div className="text-xs text-slate-500 mb-0.5">Equivalent value</div>
                                            <div className="text-base md:text-lg font-semibold text-slate-900">£2.00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SURVEYS SECTION */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Available Surveys</h2>
                                    <p className="text-xs md:text-sm text-slate-600 mt-1">Complete surveys to contribute to sector development</p>
                                </div>
                                {surveys.length > 0 && (
                                    <Badge variant="outline" className="text-xs md:text-sm w-fit">
                                        {surveys.length} active
                                    </Badge>
                                )}
                            </div>
                            
                            {surveys.length === 0 ? (
                                <Card className="border-2 border-dashed">
                                    <CardContent className="py-12 md:py-16 text-center px-4">
                                        <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                                            No surveys available
                                        </h3>
                                        <p className="text-xs md:text-sm text-slate-600">
                                            Check back regularly for new opportunities to provide feedback
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {surveys.map(survey => (
                                        <SurveyCard
                                            key={survey.id}
                                            survey={survey}
                                            hasResponded={hasUserResponded(survey.id)}
                                            isPastDeadline={isPastDeadline(survey)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* COMPLETED SURVEYS */}
                        {userResponseSurveyIds.size > 0 && (
                            <div className="mt-8 md:mt-12">
                                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 md:mb-6">Your Contributions</h2>
                                <Card className="bg-emerald-50/50 border-emerald-200">
                                    <CardContent className="p-5 md:p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-600 rounded-lg flex-shrink-0">
                                                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-base md:text-lg font-semibold text-slate-900">
                                                    {userResponseSurveyIds.size} survey{userResponseSurveyIds.size !== 1 ? 's' : ''} completed
                                                </p>
                                                <p className="text-xs md:text-sm text-slate-600">
                                                    Thank you for contributing to sector development
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}