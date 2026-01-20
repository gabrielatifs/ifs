import React, { useState } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Loader2, Briefcase, Plus, X, Upload, FileText } from 'lucide-react';
import { submitJobForReview } from '@ifs/shared/api/functions';
import { useToast } from '@ifs/shared/components/ui/use-toast';
import LocationSearchInput from '@ifs/shared/components/ui/LocationSearchInput';
import ReactQuill from 'react-quill';
import { ifs } from '@ifs/shared/api/ifsClient';

export default function SubmitJobForm({ organisationName, onSuccess, onCancel }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        companyName: organisationName || '',
        department: '',
        location: '',
        latitude: null,
        longitude: null,
        workingArrangement: 'On-site',
        description: '',
        keyResponsibilities: [''],
        requirements: [''],
        desirableSkills: [''],
        salaryDisplayText: '',
        benefits: [''],
        contractType: '',
        workingHours: '',
        experienceLevel: '',
        sector: '',
        safeguardingFocus: [],
        applicationDeadline: '',
        startDate: '',
        contactEmail: '',
        applicationMethod: '',
        applicationUrl: '',
        companyDescription: '',
        attachments: []
    });

    const handleLocationChange = (locationData) => {
        if (locationData && locationData.geometry) {
            setFormData(prev => ({
                ...prev,
                location: locationData.formatted_address || locationData.name,
                latitude: locationData.geometry.location.lat,
                longitude: locationData.geometry.location.lng
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                location: locationData || '',
                latitude: null,
                longitude: null
            }));
        }
    };

    const handleArrayFieldChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayField = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray.length ? newArray : [''] });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 10MB",
                variant: "destructive"
            });
            return;
        }

        setUploadingFile(true);
        try {
            const response = await ifs.integrations.Core.UploadFile({ file });
            
            const attachment = {
                name: file.name,
                url: response.file_url,
                type: file.type,
                size: file.size
            };

            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, attachment]
            }));

            toast({
                title: "File uploaded",
                description: `${file.name} has been attached to this job posting`
            });
        } catch (error) {
            console.error('File upload error:', error);
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload file",
                variant: "destructive"
            });
        } finally {
            setUploadingFile(false);
        }
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Filter out empty array items
            const cleanedData = {
                ...formData,
                keyResponsibilities: formData.keyResponsibilities.filter(r => r.trim()),
                requirements: formData.requirements.filter(r => r.trim()),
                desirableSkills: formData.desirableSkills.filter(s => s.trim()),
                benefits: formData.benefits.filter(b => b.trim())
            };

            const response = await submitJobForReview({ jobData: cleanedData });

            if (response.data.success) {
                toast({
                    title: "Job Submitted Successfully",
                    description: "Your job posting is now pending review. We'll notify you once it's approved.",
                    className: 'bg-green-100 border-green-300 text-green-800'
                });
                onSuccess();
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Job submission error:', error);
            toast({
                title: "Submission Failed",
                description: error.message || "Failed to submit job posting",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Briefcase className="w-6 h-6" />
                    Submit a Job Posting
                </CardTitle>
                <CardDescription>
                    Post a job opportunity that will be reviewed by our team before publication
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Basic Information</h3>
                        
                        <div>
                            <Label htmlFor="title">Job Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., Designated Safeguarding Lead"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="companyName">Organisation Name *</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                                placeholder="Your organisation name"
                                className="mt-1"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sector">Sector *</Label>
                                <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select sector" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Education">Education</SelectItem>
                                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                                        <SelectItem value="Social Care">Social Care</SelectItem>
                                        <SelectItem value="Local Authority">Local Authority</SelectItem>
                                        <SelectItem value="Charity">Charity</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="location">Location *</Label>
                                <LocationSearchInput
                                    value={formData.location}
                                    onChange={handleLocationChange}
                                    placeholder="e.g., London, UK"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contractType">Contract Type *</Label>
                                <Select value={formData.contractType} onValueChange={(value) => setFormData({ ...formData, contractType: value })} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Permanent">Permanent</SelectItem>
                                        <SelectItem value="Fixed-term">Fixed-term</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Temporary">Temporary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="workingHours">Working Hours *</Label>
                                <Select value={formData.workingHours} onValueChange={(value) => setFormData({ ...formData, workingHours: value })} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select hours" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Job share">Job share</SelectItem>
                                        <SelectItem value="Flexible">Flexible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="experienceLevel">Experience Level *</Label>
                                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Entry-level">Entry-level</SelectItem>
                                        <SelectItem value="Mid-level">Mid-level</SelectItem>
                                        <SelectItem value="Senior">Senior</SelectItem>
                                        <SelectItem value="Leadership">Leadership</SelectItem>
                                        <SelectItem value="Executive">Executive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="workingArrangement">Working Arrangement *</Label>
                                <Select value={formData.workingArrangement} onValueChange={(value) => setFormData({ ...formData, workingArrangement: value })} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                        <SelectItem value="Remote">Remote</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Job Description</h3>
                        
                        <div>
                            <Label htmlFor="description">Job Description *</Label>
                            <div className="mt-2">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={(value) => setFormData({ ...formData, description: value })}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link'],
                                            ['clean']
                                        ]
                                    }}
                                    placeholder="Provide a detailed description of the role..."
                                    style={{ 
                                        height: '250px',
                                        marginBottom: '50px'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Key Responsibilities</Label>
                            <div className="space-y-2 mt-1">
                                {formData.keyResponsibilities.map((resp, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={resp}
                                            onChange={(e) => handleArrayFieldChange('keyResponsibilities', index, e.target.value)}
                                            placeholder="Add a responsibility..."
                                        />
                                        {formData.keyResponsibilities.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayField('keyResponsibilities', index)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('keyResponsibilities')}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Responsibility
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label>Requirements</Label>
                            <div className="space-y-2 mt-1">
                                {formData.requirements.map((req, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={req}
                                            onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                                            placeholder="Add a requirement..."
                                        />
                                        {formData.requirements.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayField('requirements', index)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('requirements')}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Requirement
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Salary & Benefits */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Salary & Benefits</h3>
                        
                        <div>
                            <Label htmlFor="salaryDisplayText">Salary *</Label>
                            <Input
                                id="salaryDisplayText"
                                value={formData.salaryDisplayText}
                                onChange={(e) => setFormData({ ...formData, salaryDisplayText: e.target.value })}
                                placeholder="e.g., £35,000 - £42,000 per annum"
                                className="mt-1"
                                required
                            />
                        </div>

                        <div>
                            <Label>Benefits</Label>
                            <div className="space-y-2 mt-1">
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={benefit}
                                            onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                                            placeholder="Add a benefit..."
                                        />
                                        {formData.benefits.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayField('benefits', index)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('benefits')}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Benefit
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Attachments (Optional)</h3>
                        
                        <div>
                            <Label htmlFor="fileUpload">Upload Documents</Label>
                            <p className="text-xs text-slate-500 mb-2">
                                Add job descriptions, application forms, or other relevant documents (Max 10MB per file)
                            </p>
                            <div className="mt-1">
                                <Input
                                    id="fileUpload"
                                    type="file"
                                    onChange={handleFileUpload}
                                    disabled={uploadingFile}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <Label htmlFor="fileUpload">
                                    <div className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 hover:border-slate-400 transition-all">
                                        {uploadingFile ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                                                <span className="text-sm text-slate-600">Uploading...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <p className="font-medium text-slate-900 mb-1">Click to upload</p>
                                                <p className="text-xs text-slate-500">PDF, DOC, DOCX, or TXT</p>
                                            </>
                                        )}
                                    </div>
                                </Label>
                            </div>

                            {formData.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {formData.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{attachment.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {(attachment.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttachment(index)}
                                                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900">Application Details</h3>
                        
                        <div>
                            <Label htmlFor="applicationMethod">How to Apply *</Label>
                            <Select value={formData.applicationMethod} onValueChange={(value) => setFormData({ ...formData, applicationMethod: value })} required>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Online Application">Online Application</SelectItem>
                                    <SelectItem value="Agency">Agency</SelectItem>
                                    <SelectItem value="Phone">Phone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="contactEmail">Contact Email *</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                required
                                placeholder="recruitment@example.com"
                                className="mt-1"
                            />
                        </div>

                        {formData.applicationMethod === 'Online Application' && (
                            <div>
                                <Label htmlFor="applicationUrl">Application URL</Label>
                                <Input
                                    id="applicationUrl"
                                    type="url"
                                    value={formData.applicationUrl}
                                    onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="mt-1"
                                />
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                                <Input
                                    id="applicationDeadline"
                                    type="date"
                                    value={formData.applicationDeadline}
                                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="startDate">Expected Start Date</Label>
                                <Input
                                    id="startDate"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    placeholder="e.g., ASAP, September 2025"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-slate-900 hover:bg-slate-800"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Submit for Review
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}