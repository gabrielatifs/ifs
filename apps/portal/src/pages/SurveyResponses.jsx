
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { base44 } from '@ifs/shared/api/base44Client';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createPageUrl, navigateToUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ifs/shared/components/ui/tabs';
import { 
    Loader2, 
    ArrowLeft, 
    Download,
    BarChart3,
    List,
    Star,
    MessageSquare,
    Users,
    Edit2,
    Layers,
    Shield
} from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { format } from 'date-fns';

const ResponsesListView = ({ responses, demographics, questions, sections }) => {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Privacy Protected Responses</p>
                        <p className="text-sm text-blue-700">
                            User identities are separated from responses. Only demographic data is shown below.
                        </p>
                    </div>
                </div>
            </div>

            {responses.map((response) => {
                const demographic = demographics[response.demographicId];
                
                return (
                    <Card key={response.id}>
                        <CardHeader className="pb-3 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {demographic?.membershipType && (
                                        <Badge variant="outline" className="bg-white">
                                            {demographic.membershipType} Member
                                        </Badge>
                                    )}
                                    {demographic?.sector && (
                                        <Badge variant="outline" className="bg-white">
                                            {demographic.sector}
                                        </Badge>
                                    )}
                                    {demographic?.safeguardingRole && (
                                        <Badge variant="outline" className="bg-white">
                                            {demographic.safeguardingRole}
                                        </Badge>
                                    )}
                                    {demographic?.country && (
                                        <Badge variant="outline" className="bg-white text-xs">
                                            📍 {demographic.country}
                                        </Badge>
                                    )}
                                </div>
                                <Badge variant="outline">
                                    {format(new Date(response.submittedDate || response.created_date), 'MMM d, yyyy')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {sections && sections.length > 0 ? (
                                    <>
                                        {questions.filter(q => !q.sectionId).map((question) => {
                                            const answer = response.responses[question.id];
                                            const comment = response.responses[`${question.id}_comment`];
                                            if (!answer || (Array.isArray(answer) && answer.length === 0)) return null;
                                            
                                            return (
                                                <div key={question.id} className="border-l-4 border-purple-300 pl-4">
                                                    <p className="text-sm font-semibold text-slate-700 mb-2">{question.text}</p>
                                                    <div className="p-3 bg-purple-50 rounded-lg">
                                                        <p className="text-sm text-slate-800">
                                                            {Array.isArray(answer) ? answer.join(', ') : answer.toString()}
                                                        </p>
                                                    </div>
                                                    {comment && (
                                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <p className="text-xs font-medium text-blue-700 mb-1">
                                                                💬 {question.commentLabel || 'Additional comments:'}
                                                            </p>
                                                            <p className="text-sm text-slate-700">{comment}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        
                                        {sections.map((section) => {
                                            const sectionQuestions = questions.filter(q => q.sectionId === section.id);
                                            if (sectionQuestions.length === 0) return null;
                                            
                                            return (
                                                <div key={section.id} className="border-t pt-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Layers className="w-4 h-4 text-purple-600" />
                                                        <h4 className="font-bold text-slate-800">{section.title}</h4>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {sectionQuestions.map((question) => {
                                                            const answer = response.responses[question.id];
                                                            const comment = response.responses[`${question.id}_comment`];
                                                            if (!answer || (Array.isArray(answer) && answer.length === 0)) return null;
                                                            
                                                            return (
                                                                <div key={question.id} className="border-l-4 border-purple-300 pl-4">
                                                                    <p className="text-sm font-semibold text-slate-700 mb-2">{question.text}</p>
                                                                    <div className="p-3 bg-purple-50 rounded-lg">
                                                                        <p className="text-sm text-slate-800">
                                                                            {Array.isArray(answer) ? answer.join(', ') : answer.toString()}
                                                                        </p>
                                                                    </div>
                                                                    {comment && (
                                                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                            <p className="text-xs font-medium text-blue-700 mb-1">
                                                                                💬 {question.commentLabel || 'Additional comments:'}
                                                                            </p>
                                                                            <p className="text-sm text-slate-700">{comment}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    questions.map((question) => {
                                        const answer = response.responses[question.id];
                                        const comment = response.responses[`${question.id}_comment`];
                                        if (!answer || (Array.isArray(answer) && answer.length === 0)) return null;
                                        
                                        return (
                                            <div key={question.id} className="border-l-4 border-purple-300 pl-4">
                                                <p className="text-sm font-semibold text-slate-700 mb-2">{question.text}</p>
                                                <div className="p-3 bg-purple-50 rounded-lg">
                                                    <p className="text-sm text-slate-800">
                                                        {Array.isArray(answer) ? answer.join(', ') : answer.toString()}
                                                    </p>
                                                </div>
                                                {comment && (
                                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <p className="text-xs font-medium text-blue-700 mb-1">
                                                            💬 {question.commentLabel || 'Additional comments:'}
                                                        </p>
                                                        <p className="text-sm text-slate-700">{comment}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            
            {responses.length === 0 && (
                <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No responses yet</p>
                </div>
            )}
        </div>
    );
};

const AnalyticsView = ({ responses, demographics, questions }) => {
    const getQuestionAnalytics = (question) => {
        const questionResponses = responses.map(r => r.responses[question.id]).filter(Boolean);
        const comments = responses.map(r => r.responses[`${question.id}_comment`]).filter(Boolean);
        
        if (question.type === 'rating' || question.type === 'scale') {
            const values = questionResponses.map(r => parseFloat(r)).filter(v => !isNaN(v));
            const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            const distribution = {};
            values.forEach(v => {
                distribution[v] = (distribution[v] || 0) + 1;
            });
            
            return { type: 'numeric', average: avg.toFixed(1), distribution, total: values.length, comments };
        }
        
        if (question.type === 'radio') {
            const distribution = {};
            questionResponses.forEach(r => {
                distribution[r] = (distribution[r] || 0) + 1;
            });
            return { type: 'single-choice', distribution, total: questionResponses.length, comments };
        }
        
        if (question.type === 'checkbox') {
            const distribution = {};
            questionResponses.forEach(r => {
                if (Array.isArray(r)) {
                    r.forEach(option => {
                        distribution[option] = (distribution[option] || 0) + 1;
                    });
                }
            });
            return { type: 'multiple-choice', distribution, total: questionResponses.length, comments };
        }
        
        return { type: 'text', responses: questionResponses, total: questionResponses.length, comments };
    };

    // Demographic breakdown
    const demographicBreakdown = {
        membershipType: {},
        sector: {},
        safeguardingRole: {},
        country: {}
    };

    Object.values(demographics).forEach(demo => {
        if (demo.membershipType) {
            demographicBreakdown.membershipType[demo.membershipType] = 
                (demographicBreakdown.membershipType[demo.membershipType] || 0) + 1;
        }
        if (demo.sector) {
            demographicBreakdown.sector[demo.sector] = 
                (demographicBreakdown.sector[demo.sector] || 0) + 1;
        }
        if (demo.safeguardingRole) {
            demographicBreakdown.safeguardingRole[demo.safeguardingRole] = 
                (demographicBreakdown.safeguardingRole[demo.safeguardingRole] || 0) + 1;
        }
        if (demo.country) {
            demographicBreakdown.country[demo.country] = 
                (demographicBreakdown.country[demo.country] || 0) + 1;
        }
    });

    return (
        <div className="space-y-6">
            {/* Demographic Overview */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Respondent Demographics
                    </CardTitle>
                    <CardDescription>Aggregated demographic data (all responses are anonymous)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        {Object.keys(demographicBreakdown.membershipType).length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Membership Type</h4>
                                <div className="space-y-2">
                                    {Object.entries(demographicBreakdown.membershipType)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([type, count]) => {
                                            const percentage = ((count / responses.length) * 100).toFixed(1);
                                            return (
                                                <div key={type} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-700">{type}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-purple-600 h-2 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-slate-600 font-medium w-12 text-right">{percentage}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                        
                        {Object.keys(demographicBreakdown.sector).length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Sector</h4>
                                <div className="space-y-2">
                                    {Object.entries(demographicBreakdown.sector)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([sector, count]) => {
                                            const percentage = ((count / responses.length) * 100).toFixed(1);
                                            return (
                                                <div key={sector} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-700">{sector}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-indigo-600 h-2 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-slate-600 font-medium w-12 text-right">{percentage}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Question Analytics */}
            {questions.map((question) => {
                const analytics = getQuestionAnalytics(question);
                
                return (
                    <Card key={question.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{question.text}</CardTitle>
                            <CardDescription>
                                {analytics.total} response{analytics.total !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analytics.type === 'numeric' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600">{analytics.average}</div>
                                            <div className="text-sm text-purple-700">Average</div>
                                        </div>
                                        {question.type === 'rating' && (
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star 
                                                        key={star} 
                                                        className={`w-6 h-6 ${
                                                            parseFloat(analytics.average) >= star 
                                                                ? 'text-amber-500 fill-amber-500' 
                                                                : 'text-slate-300'
                                                        }`} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(analytics.distribution)
                                            .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
                                            .map(([value, count]) => {
                                                const percentage = ((count / analytics.total) * 100).toFixed(1);
                                                return (
                                                    <div key={value} className="flex items-center gap-3">
                                                        <div className="w-8 text-sm font-medium text-slate-700">{value}</div>
                                                        <div className="flex-1 bg-slate-200 rounded-full h-8 relative overflow-hidden">
                                                            <div 
                                                                className="bg-purple-600 h-full rounded-full transition-all flex items-center justify-end pr-3"
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className="text-xs font-semibold text-white">
                                                                    {percentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-12 text-sm text-slate-600 text-right">{count}</div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {(analytics.type === 'single-choice' || analytics.type === 'multiple-choice') && (
                                <div className="space-y-2">
                                    {Object.entries(analytics.distribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([option, count]) => {
                                            const percentage = ((count / analytics.total) * 100).toFixed(1);
                                            return (
                                                <div key={option} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium text-slate-700">{option}</span>
                                                        <span className="text-slate-600">{count} ({percentage}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className="bg-purple-600 h-full rounded-full transition-all"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}

                            {analytics.type === 'text' && (
                                <div className="space-y-3">
                                    {analytics.responses.map((response, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <p className="text-sm text-slate-700">{response}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {analytics.comments && analytics.comments.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Additional Comments ({analytics.comments.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {analytics.comments.map((comment, idx) => (
                                            <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm text-slate-700">{comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default function SurveyResponses() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState(null);
    const [responses, setResponses] = useState([]);
    const [demographics, setDemographics] = useState({});
    const [activeTab, setActiveTab] = useState('analytics');
    
    const query = new URLSearchParams(location.search);
    const surveyId = query.get('id');

    useEffect(() => {
        if (!userLoading && (!user || user.role !== 'admin')) {
            navigate(createPageUrl('Dashboard'));
        }
    }, [user, userLoading, navigate]);

    useEffect(() => {
        if (surveyId && user && user.role === 'admin') {
            fetchSurveyData();
        }
    }, [surveyId, user]);

    const fetchSurveyData = async () => {
        setLoading(true);
        try {
            const [surveyData, responsesData] = await Promise.all([
                base44.entities.Survey.get(surveyId),
                base44.entities.SurveyResponse.filter({ surveyId }, '-submittedDate')
            ]);

            setSurvey(surveyData);
            setResponses(responsesData);

            const demographicIds = [...new Set(responsesData.map(r => r.demographicId))];
            const demographicRecords = await Promise.all(
                demographicIds.map(id => base44.entities.SurveyDemographic.get(id))
            );
            
            const demographicsMap = {};
            demographicRecords.forEach(demo => {
                if (demo) demographicsMap[demo.id] = demo;
            });
            
            setDemographics(demographicsMap);

        } catch (error) {
            console.error('Failed to fetch survey data:', error);
            toast({
                title: "Error",
                description: "Could not load survey responses",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const escapeCsvCell = (value) => {
        if (value === null || value === undefined) return '';
        
        const stringValue = value.toString();
        
        // Replace all newlines with spaces
        const noNewlines = stringValue.replace(/(\r\n|\n|\r)/g, ' ');
        
        // Replace all double quotes with double double quotes
        const escapedQuotes = noNewlines.replace(/"/g, '""');
        
        // Always wrap in quotes for safety
        return `"${escapedQuotes}"`;
    };

    const handleExport = () => {
        try {
            if (!survey || responses.length === 0) {
                toast({
                    title: "No Data",
                    description: "No responses to export",
                    variant: "destructive"
                });
                return;
            }

            // Build headers
            const headers = [
                'Response ID',
                'Submitted Date',
                'Membership Type',
                'Sector',
                'Subsector',
                'Safeguarding Role',
                'Job Role',
                'Country',
                'City',
                'Training Refresh Frequency',
                'Receives Supervision',
                'Has Organisational Membership'
            ];
            
            survey.questions.forEach(q => {
                headers.push(q.text);
                if (q.allowComments) {
                    headers.push(`${q.text} - Comments`);
                }
            });
            
            // Build rows with proper CSV escaping
            const rows = responses.map(response => {
                const demographic = demographics[response.demographicId] || {};
                const row = [
                    response.id,
                    format(new Date(response.submittedDate || response.created_date), 'dd/MM/yyyy HH:mm'),
                    demographic.membershipType || '',
                    demographic.sector || '',
                    demographic.subsector || '',
                    demographic.safeguardingRole || '',
                    demographic.jobRole || '',
                    demographic.country || '',
                    demographic.city || '',
                    demographic.trainingRefreshFrequency || '',
                    demographic.receivesSupervision ? 'Yes' : (demographic.receivesSupervision === false ? 'No' : ''),
                    demographic.hasOrganisationalMembership ? 'Yes' : (demographic.hasOrganisationalMembership === false ? 'No' : '')
                ];
                
                survey.questions.forEach(q => {
                    const answer = response.responses[q.id];
                    if (Array.isArray(answer)) {
                        row.push(answer.join('; '));
                    } else {
                        row.push(answer || '');
                    }
                    
                    if (q.allowComments) {
                        row.push(response.responses[`${q.id}_comment`] || '');
                    }
                });
                
                return row;
            });
            
            // Build CSV with proper escaping
            const csvContent = [
                headers.map(h => escapeCsvCell(h)).join(','),
                ...rows.map(row => row.map(cell => escapeCsvCell(cell)).join(','))
            ].join('\n');
            
            // Create and download the file
            // Add BOM (Byte Order Mark) for better UTF-8 compatibility in Excel
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            const fileName = `survey-responses-${survey.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Release the object URL
            
            toast({
                title: "Export Successful",
                description: `Exported ${responses.length} anonymous responses with demographic data to CSV`
            });
        } catch (error) {
            console.error('Failed to export:', error);
            toast({
                title: "Export Failed",
                description: "Could not export responses. Please try again.",
                variant: "destructive"
            });
        }
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || user.role !== 'admin' || !survey) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="AdminDashboard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigateToUrl(navigate, createPageUrl('AdminDashboard') + '?tab=surveys')}
                            className="mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Surveys
                        </Button>

                        <div className="flex items-start justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{survey.title}</h1>
                                <p className="text-slate-600">{survey.description}</p>
                                <div className="flex gap-2 mt-3">
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                        <Shield className="w-3 h-3 mr-1" />
                                        {responses.length} anonymous response{responses.length !== 1 ? 's' : ''}
                                    </Badge>
                                    <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                                        {survey.status}
                                    </Badge>
                                    {survey.targetAudience !== 'all' && (
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                            {survey.targetAudience} Members
                                        </Badge>
                                    )}
                                    {survey.sections && survey.sections.length > 0 && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            <Layers className="w-3 h-3 mr-1" />
                                            {survey.sections.length} sections
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleExport} disabled={responses.length === 0} variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button asChild variant="outline">
                                    <Link to={createPageUrl('EditSurvey') + `?id=${survey.id}`}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Survey
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-md">
                                <TabsTrigger value="analytics" className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="list" className="flex items-center gap-2">
                                    <List className="w-4 h-4" />
                                    Individual Responses
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="analytics" className="mt-6">
                                {responses.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-16 text-center">
                                            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600">No responses to analyze yet</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <AnalyticsView responses={responses} demographics={demographics} questions={survey.questions} />
                                )}
                            </TabsContent>

                            <TabsContent value="list" className="mt-6">
                                <ResponsesListView 
                                    responses={responses} 
                                    demographics={demographics}
                                    questions={survey.questions}
                                    sections={survey.sections}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
