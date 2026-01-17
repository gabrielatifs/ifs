
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@ifs/shared/api/base44Client';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createPageUrl, navigateToUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Label } from '@ifs/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Switch } from '@ifs/shared/components/ui/switch';
import { 
    Loader2, 
    ArrowLeft, 
    Save, 
    Plus, 
    Trash2, 
    GripVertical,
    ListChecks,
    Layers
} from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { Badge } from '@ifs/shared/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@ifs/shared/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const QuestionEditor = ({ question, onChange, onDelete, index, sectionTitle, isDragging }) => {
    const handleFieldChange = (field, value) => {
        onChange({ ...question, [field]: value });
    };

    const handleOptionChange = (optionIndex, value) => {
        const newOptions = [...(question.options || [])];
        newOptions[optionIndex] = value;
        onChange({ ...question, options: newOptions });
    };

    const addOption = () => {
        onChange({ ...question, options: [...(question.options || []), ''] });
    };

    const removeOption = (optionIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optionIndex);
        onChange({ ...question, options: newOptions });
    };

    const needsOptions = ['radio', 'checkbox'].includes(question.type);
    const needsRange = question.type === 'scale';

    return (
        <Card className={`border-l-4 border-l-purple-600 transition-shadow ${isDragging ? 'shadow-2xl ring-2 ring-purple-400' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                        <div className="p-1 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold text-slate-700">Question {index + 1}</Label>
                                {sectionTitle && (
                                    <Badge variant="outline" className="text-xs">
                                        {sectionTitle}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor={`question-text-${question.id}`}>Question Text *</Label>
                    <Input
                        id={`question-text-${question.id}`}
                        value={question.text || ''}
                        onChange={(e) => handleFieldChange('text', e.target.value)}
                        placeholder="Enter your question"
                        className="mt-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`question-type-${question.id}`}>Question Type *</Label>
                        <Select value={question.type || 'text'} onValueChange={(value) => handleFieldChange('type', value)}>
                            <SelectTrigger id={`question-type-${question.id}`} className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Short Text</SelectItem>
                                <SelectItem value="textarea">Long Text</SelectItem>
                                <SelectItem value="radio">Single Choice</SelectItem>
                                <SelectItem value="checkbox">Multiple Choice</SelectItem>
                                <SelectItem value="rating">Star Rating (1-5)</SelectItem>
                                <SelectItem value="scale">Scale</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                        <Switch
                            id={`required-${question.id}`}
                            checked={question.required || false}
                            onCheckedChange={(checked) => handleFieldChange('required', checked)}
                        />
                        <Label htmlFor={`required-${question.id}`} className="cursor-pointer">
                            Required
                        </Label>
                    </div>
                </div>

                {needsOptions && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="mb-0">Options *</Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`other-option-${question.id}`}
                                    checked={question.hasOtherOption || false}
                                    onCheckedChange={(checked) => handleFieldChange('hasOtherOption', checked)}
                                />
                                <Label htmlFor={`other-option-${question.id}`} className="cursor-pointer text-sm">
                                    Include "Other (please specify)"
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {(question.options || []).map((option, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(idx)}
                                        className="flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Option
                            </Button>
                        </div>
                    </div>
                )}

                {needsRange && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`min-${question.id}`}>Minimum Value</Label>
                            <Input
                                id={`min-${question.id}`}
                                type="number"
                                value={question.minValue || 1}
                                onChange={(e) => handleFieldChange('minValue', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`max-${question.id}`}>Maximum Value</Label>
                            <Input
                                id={`max-${question.id}`}
                                type="number"
                                value={question.maxValue || 10}
                                onChange={(e) => handleFieldChange('maxValue', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>
                )}

                {/* Comment Box Option */}
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`comments-${question.id}`}
                            checked={question.allowComments || false}
                            onCheckedChange={(checked) => handleFieldChange('allowComments', checked)}
                        />
                        <Label htmlFor={`comments-${question.id}`} className="cursor-pointer">
                            Allow additional comments for this question
                        </Label>
                    </div>
                    
                    {question.allowComments && (
                        <div>
                            <Label htmlFor={`comment-label-${question.id}`} className="text-sm">Comment Box Label (Optional)</Label>
                            <Input
                                id={`comment-label-${question.id}`}
                                value={question.commentLabel || ''}
                                onChange={(e) => handleFieldChange('commentLabel', e.target.value)}
                                placeholder="e.g., Please provide additional details"
                                className="mt-1"
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const SectionEditor = ({ section, onChange, onDelete }) => {
    return (
        <Card className="bg-slate-50 border-2 border-slate-300">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-2 flex-1">
                        <GripVertical className="w-5 h-5 text-slate-400 mt-1 cursor-move" />
                        <div className="flex-1 space-y-3">
                            <div>
                                <Label htmlFor={`section-title-${section.id}`}>Section Title *</Label>
                                <Input
                                    id={`section-title-${section.id}`}
                                    value={section.title || ''}
                                    onChange={(e) => onChange({ ...section, title: e.target.value })}
                                    placeholder="e.g., About Your Experience"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`section-desc-${section.id}`}>Section Description (Optional)</Label>
                                <Textarea
                                    id={`section-desc-${section.id}`}
                                    value={section.description || ''}
                                    onChange={(e) => onChange({ ...section, description: e.target.value })}
                                    placeholder="Brief description of this section"
                                    rows={2}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function EditSurvey() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    
    const query = new URLSearchParams(location.search);
    const surveyId = query.get('id');
    const isEditMode = !!surveyId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sections: [],
        questions: [],
        status: 'draft',
        isAlwaysAvailable: true,
        startDate: '',
        endDate: '',
        targetAudience: 'all',
        allowMultipleResponses: false,
        responseCount: 0
    });

    useEffect(() => {
        if (!userLoading && (!user || user.role !== 'admin')) {
            navigate(createPageUrl('Dashboard'));
        }
    }, [user, userLoading, navigate]);

    useEffect(() => {
        if (isEditMode && user && user.role === 'admin') {
            fetchSurvey();
        } else {
            setLoading(false);
        }
    }, [isEditMode, user]);

    const fetchSurvey = async () => {
        try {
            const survey = await base44.entities.Survey.get(surveyId);
            if (survey) {
                setFormData({
                    ...survey,
                    sections: survey.sections || [],
                    questions: survey.questions || []
                });
            } else {
                toast({
                    title: "Error",
                    description: "Survey not found",
                    variant: "destructive"
                });
                navigateToUrl(navigate, createPageUrl('AdminDashboard'));
            }
        } catch (error) {
            console.error('Failed to fetch survey:', error);
            toast({
                title: "Error",
                description: "Could not load survey",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addSection = () => {
        const newSection = {
            id: `section-${Date.now()}`,
            title: '',
            description: ''
        };
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
    };

    const updateSection = (index, updatedSection) => {
        const newSections = [...formData.sections];
        newSections[index] = updatedSection;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const deleteSection = (index) => {
        const sectionToDelete = formData.sections[index];
        // Remove questions in this section
        const newQuestions = formData.questions.filter(q => q.sectionId !== sectionToDelete.id);
        const newSections = formData.sections.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, sections: newSections, questions: newQuestions }));
    };

    const addQuestion = (sectionId = null) => {
        const newQuestion = {
            id: `q-${Date.now()}`,
            sectionId: sectionId,
            text: '',
            type: 'text',
            required: false,
            options: [],
            hasOtherOption: false,
            allowComments: false,
            commentLabel: ''
        };
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const updateQuestion = (index, updatedQuestion) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = updatedQuestion;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const deleteQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleQuestionDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        
        // Reorder questions array
        const items = Array.from(formData.questions);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        setFormData(prev => ({ ...prev, questions: items }));
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a survey title",
                variant: "destructive"
            });
            return;
        }

        if (formData.questions.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please add at least one question",
                variant: "destructive"
            });
            return;
        }

        // Validate sections
        for (let i = 0; i < formData.sections.length; i++) {
            const s = formData.sections[i];
            if (!s.title.trim()) {
                toast({
                    title: "Validation Error",
                    description: `Section ${i + 1} needs a title`,
                    variant: "destructive"
                });
                return;
            }
        }

        // Validate all questions
        for (let i = 0; i < formData.questions.length; i++) {
            const q = formData.questions[i];
            if (!q.text.trim()) {
                toast({
                    title: "Validation Error",
                    description: `Question ${i + 1} needs text`,
                    variant: "destructive"
                });
                return;
            }
            if (['radio', 'checkbox'].includes(q.type) && (!q.options || q.options.length < 2)) {
                toast({
                    title: "Validation Error",
                    description: `Question ${i + 1} needs at least 2 options`,
                    variant: "destructive"
                });
                return;
            }
        }

        setSaving(true);
        try {
            if (isEditMode) {
                await base44.entities.Survey.update(surveyId, formData);
                toast({
                    title: "Survey Updated",
                    description: "Your changes have been saved successfully"
                });
            } else {
                await base44.entities.Survey.create(formData);
                toast({
                    title: "Survey Created",
                    description: "Your survey has been created successfully"
                });
            }
            navigateToUrl(navigate, createPageUrl('AdminDashboard') + '?tab=surveys');
        } catch (error) {
            console.error('Failed to save survey:', error);
            toast({
                title: "Save Failed",
                description: error.message || "Could not save survey",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await base44.entities.Survey.delete(surveyId);
            toast({
                title: "Survey Deleted",
                description: "The survey has been permanently deleted"
            });
            navigateToUrl(navigate, createPageUrl('AdminDashboard') + '?tab=surveys');
        } catch (error) {
            console.error('Failed to delete survey:', error);
            toast({
                title: "Delete Failed",
                description: error.message || "Could not delete survey",
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

    if (!user || user.role !== 'admin') {
        return null;
    }

    // Group questions by section for display purposes or future grouped reordering
    // For now, we're using a single flat Droppable for all questions as per the dnd implementation.
    // The section information will still be displayed on the question card using sectionTitle prop.
    const getSectionTitle = (sectionId) => {
        if (!sectionId) return null;
        const section = formData.sections.find(s => s.id === sectionId);
        return section ? section.title : null;
    };


    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="AdminDashboard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigateToUrl(navigate, createPageUrl('AdminDashboard') + '?tab=surveys')}
                            className="mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Admin Dashboard
                        </Button>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {isEditMode ? 'Edit Survey' : 'Create New Survey'}
                            </h1>
                            <p className="text-slate-600">
                                Create surveys to gather feedback from your members
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Survey Details</CardTitle>
                                    <CardDescription>Basic information about your survey</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Survey Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleFieldChange('title', e.target.value)}
                                            placeholder="e.g., 2024 Member Satisfaction Survey"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleFieldChange('description', e.target.value)}
                                            placeholder="Explain the purpose of this survey"
                                            rows={3}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="targetAudience">Target Audience</Label>
                                            <Select 
                                                value={formData.targetAudience} 
                                                onValueChange={(value) => handleFieldChange('targetAudience', value)}
                                            >
                                                <SelectTrigger id="targetAudience" className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Members</SelectItem>
                                                    <SelectItem value="Associate">Associate Members Only</SelectItem>
                                                    <SelectItem value="Full">Full Members Only</SelectItem>
                                                    <SelectItem value="Fellow">Fellows Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <Select 
                                                value={formData.status} 
                                                onValueChange={(value) => handleFieldChange('status', value)}
                                            >
                                                <SelectTrigger id="status" className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="isAlwaysAvailable"
                                            checked={formData.isAlwaysAvailable}
                                            onCheckedChange={(checked) => handleFieldChange('isAlwaysAvailable', checked)}
                                        />
                                        <Label htmlFor="isAlwaysAvailable" className="cursor-pointer">
                                            Always Available (no time limit)
                                        </Label>
                                    </div>

                                    {!formData.isAlwaysAvailable && (
                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                                            <div>
                                                <Label htmlFor="startDate">Start Date (Optional)</Label>
                                                <Input
                                                    id="startDate"
                                                    type="datetime-local"
                                                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => handleFieldChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="endDate">End Date (Optional)</Label>
                                                <Input
                                                    id="endDate"
                                                    type="datetime-local"
                                                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => handleFieldChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="allowMultipleResponses"
                                            checked={formData.allowMultipleResponses}
                                            onCheckedChange={(checked) => handleFieldChange('allowMultipleResponses', checked)}
                                        />
                                        <Label htmlFor="allowMultipleResponses" className="cursor-pointer">
                                            Allow multiple responses per user
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sections Management */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Survey Sections</CardTitle>
                                            <CardDescription>Organize your questions into logical sections (optional)</CardDescription>
                                        </div>
                                        <Button onClick={addSection} variant="outline" size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Section
                                        </Button>
                                    </div>
                                </CardHeader>
                                {formData.sections.length > 0 && (
                                    <CardContent className="space-y-4">
                                        {formData.sections.map((section, index) => (
                                            <SectionEditor
                                                key={section.id}
                                                section={section}
                                                onChange={(updated) => updateSection(index, updated)}
                                                onDelete={() => deleteSection(index)}
                                            />
                                        ))}
                                    </CardContent>
                                )}
                            </Card>

                            {/* Questions - Organized by Section with Drag and Drop */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Survey Questions</CardTitle>
                                    <CardDescription>Drag and drop to reorder questions</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {formData.questions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ListChecks className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600 mb-4">No questions yet</p>
                                            <p className="text-sm text-slate-500 mb-4">Add questions below</p>
                                        </div>
                                    ) : (
                                        <DragDropContext onDragEnd={handleQuestionDragEnd}>
                                            <Droppable droppableId="questions">
                                                {(provided, snapshot) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="space-y-4"
                                                    >
                                                        {formData.questions.map((question, index) => {
                                                            const sectionTitle = getSectionTitle(question.sectionId);
                                                            
                                                            return (
                                                                <Draggable key={question.id} draggableId={question.id} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                        >
                                                                            <QuestionEditor
                                                                                question={question}
                                                                                index={index}
                                                                                sectionTitle={sectionTitle}
                                                                                onChange={(updated) => updateQuestion(index, updated)}
                                                                                onDelete={() => deleteQuestion(index)}
                                                                                isDragging={snapshot.isDragging}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    )}

                                    {/* Add Question Buttons at Bottom */}
                                    <div className="border-t pt-6 space-y-3">
                                        {formData.sections.length > 0 ? (
                                            <>
                                                <p className="text-sm font-medium text-slate-700 mb-2">Add question to:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button onClick={() => addQuestion(null)} variant="outline" size="sm">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        General Section
                                                    </Button>
                                                    {formData.sections.map((section) => (
                                                        <Button 
                                                            key={section.id}
                                                            onClick={() => addQuestion(section.id)} 
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            {section.title || 'Untitled Section'}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <Button onClick={() => addQuestion(null)} variant="outline" className="w-full">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Question
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-6 pb-8">
                                {isEditMode && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Survey
                                    </Button>
                                )}
                                <div className={`flex gap-3 ${!isEditMode ? 'ml-auto' : ''}`}>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateToUrl(navigate, createPageUrl('AdminDashboard') + '?tab=surveys')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {isEditMode ? 'Save Changes' : 'Create Survey'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Survey?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the survey and all {formData.responseCount || 0} responses. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
