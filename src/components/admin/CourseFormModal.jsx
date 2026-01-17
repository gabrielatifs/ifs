import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadFile } from '@/api/integrations';
import { Course } from '@/api/entities';
import { CourseVariant } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, X, Upload as UploadIcon, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { syncCourseWithStripe } from '@/api/functions';

const NEW_COURSE_TEMPLATE = {
    title: '',
    level: 'Foundation',
    subCategory: '',
    description: '',
    overview: '',
    objectives: [],
    benefits: [],
    faq: [],
    imageUrl: '',
    prospectusUrl: '',
    certification: '',
};

const NEW_VARIANT_TEMPLATE = {
    name: '',
    geography: 'England',
    price: 0,
    duration: '',
    format: [],
    status: 'Available'
};

const levelOptions = ["Foundation", "Advanced", "Refresher", "Short & Specialist"];
const geographyOptions = ["England", "Wales", "Scotland", "Northern Ireland", "UK-Wide", "International"];
const formatOptions = ["In Person", "Online"];

export default function CourseFormModal({ isOpen, onClose, onSave, courseToEdit }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(NEW_COURSE_TEMPLATE);
    const [variants, setVariants] = useState([NEW_VARIANT_TEMPLATE]);
    const [newObjective, setNewObjective] = useState('');
    const [newBenefit, setNewBenefit] = useState('');
    const [newFaqQuestion, setNewFaqQuestion] = useState('');
    const [newFaqAnswer, setNewFaqAnswer] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (courseToEdit) {
            setFormData({
                title: courseToEdit.title || '',
                level: courseToEdit.level || 'Foundation',
                subCategory: courseToEdit.subCategory || '',
                description: courseToEdit.description || '',
                overview: courseToEdit.overview || '',
                objectives: courseToEdit.objectives || [],
                benefits: courseToEdit.benefits || [],
                faq: courseToEdit.faq || [],
                imageUrl: courseToEdit.imageUrl || '',
                prospectusUrl: courseToEdit.prospectusUrl || '',
                certification: courseToEdit.certification || '',
            });
            loadExistingVariants(courseToEdit.id);
        } else {
            setFormData(NEW_COURSE_TEMPLATE);
            setVariants([NEW_VARIANT_TEMPLATE]);
        }
    }, [courseToEdit, isOpen]);

    const loadExistingVariants = async (courseId) => {
        try {
            const existingVariants = await CourseVariant.filter({ courseId });
            if (existingVariants.length > 0) {
                setVariants(existingVariants.map(v => ({
                    id: v.id,
                    name: v.name,
                    geography: v.geography,
                    price: v.price,
                    duration: v.duration,
                    format: v.format || [],
                    status: v.status || 'Available'
                })));
            } else {
                setVariants([NEW_VARIANT_TEMPLATE]);
            }
        } catch (error) {
            console.error('Error loading variants:', error);
            setVariants([NEW_VARIANT_TEMPLATE]);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        setVariants(prev => prev.map((variant, i) => 
            i === index ? { ...variant, [field]: value } : variant
        ));
    };

    const addVariant = () => {
        setVariants(prev => [...prev, { ...NEW_VARIANT_TEMPLATE }]);
    };

    const removeVariant = (index) => {
        if (variants.length > 1) {
            setVariants(prev => prev.filter((_, i) => i !== index));
        } else {
            toast({ title: "Cannot Remove", description: "You must have at least one course variant.", variant: "destructive" });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const { file_url } = await UploadFile({ file });
            handleInputChange('imageUrl', file_url);
            toast({ title: 'Image Uploaded' });
        } catch (error) {
            toast({ title: 'Upload Failed', variant: 'destructive' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleProspectusUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const { file_url } = await UploadFile({ file });
            handleInputChange('prospectusUrl', file_url);
            toast({ title: 'Prospectus Uploaded' });
        } catch (error) {
            toast({ title: 'Upload Failed', variant: 'destructive' });
        } finally {
            setUploadingImage(false);
        }
    };

    const addListItem = (field, value, setValue) => {
        if (value.trim()) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
            setValue('');
        }
    };

    const removeListItem = (field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const addFaq = () => {
        if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
            setFormData(prev => ({ ...prev, faq: [...prev.faq, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }] }));
            setNewFaqQuestion('');
            setNewFaqAnswer('');
        }
    };

    const handleFormatChange = (variantIndex, format) => {
        setVariants(prev => prev.map((variant, i) => {
            if (i === variantIndex) {
                const newFormat = variant.format.includes(format)
                    ? variant.format.filter(f => f !== format)
                    : [...variant.format, format];
                return { ...variant, format: newFormat };
            }
            return variant;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Step 1: Save Course to get an ID
            let savedCourse;
            if (courseToEdit && courseToEdit.id) {
                await Course.update(courseToEdit.id, formData);
                savedCourse = { ...formData, id: courseToEdit.id };
            } else {
                savedCourse = await Course.create(formData);
            }

            // Step 2: Save Variants to get IDs
            const savedVariantPromises = variants.map(variant => {
                const { id, ...variantData } = variant;
                variantData.courseId = savedCourse.id;
                if (id) {
                    return CourseVariant.update(id, variantData);
                } else {
                    return CourseVariant.create(variantData);
                }
            });
            await Promise.all(savedVariantPromises);

            // Step 3: Sync everything with Stripe
            toast({ title: "Syncing with Stripe...", description: "Please wait while we set up payments." });
            const { data: syncResult, error: syncError } = await syncCourseWithStripe({ courseId: savedCourse.id });
            if (syncError || (syncResult && syncResult.error)) {
                throw new Error(syncError?.message || syncResult?.details || 'Stripe sync failed');
            }
            
            onSave(savedCourse);
            handleClose();
            toast({ title: `Course ${courseToEdit ? 'Updated' : 'Created'}`, description: `${savedCourse.title} has been saved and synced.` });
        } catch (error) {
            console.error("Error saving course", error);
            toast({ title: "Save Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(NEW_COURSE_TEMPLATE);
        setVariants([NEW_VARIANT_TEMPLATE]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={!isSubmitting ? handleClose : undefined}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{courseToEdit ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                    <DialogDescription>Fill in the course details and add variants for different geographies or specializations.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Course Title *</Label>
                                <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="level">Level *</Label>
                                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{levelOptions.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="subCategory">Sub-Category *</Label>
                            <Input id="subCategory" value={formData.subCategory} onChange={(e) => handleInputChange('subCategory', e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="description">Short Description</Label>
                            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="overview">Full Overview</Label>
                            <Textarea id="overview" value={formData.overview} onChange={(e) => handleInputChange('overview', e.target.value)} rows={4} />
                        </div>
                    </div>

                    {/* Course Image */}
                    <div className="space-y-2">
                         <h3 className="font-semibold text-lg border-b pb-2">Course Image</h3>
                         <Label htmlFor="image-upload">Upload an Image</Label>
                         <div className="flex items-center gap-4">
                            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload').click()} disabled={uploadingImage}>
                                <UploadIcon className="w-4 h-4 mr-2"/>{uploadingImage ? 'Uploading...' : 'Choose Image'}
                            </Button>
                            {formData.imageUrl && <p className="text-sm text-green-600">Image uploaded.</p>}
                         </div>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="rounded-lg object-cover h-48 w-full border p-1 mt-2" />}
                    </div>

                    {/* Course Prospectus */}
                    <div className="space-y-2">
                         <h3 className="font-semibold text-lg border-b pb-2">Course Prospectus (PDF)</h3>
                         <div className="flex items-center gap-4">
                            <Input id="prospectus-upload" type="file" accept="application/pdf" onChange={handleProspectusUpload} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('prospectus-upload').click()} disabled={uploadingImage}>
                                <UploadIcon className="w-4 h-4 mr-2"/>{uploadingImage ? 'Uploading...' : (formData.prospectusUrl ? 'Change Prospectus' : 'Upload Prospectus')}
                            </Button>
                            {formData.prospectusUrl && (
                                <>
                                    <p className="text-sm text-green-600">Prospectus uploaded.</p>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleInputChange('prospectusUrl', '')}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </>
                            )}
                         </div>
                    </div>

                    {/* Course Variants */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg border-b pb-2">Course Variants</h3>
                            <Button type="button" onClick={addVariant} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" /> Add Variant
                            </Button>
                        </div>
                        {variants.map((variant, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base">Variant {index + 1}</CardTitle>
                                    <Button type="button" onClick={() => removeVariant(index)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Variant Name *</Label>
                                            <Input value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <Label>Geography *</Label>
                                            <Select value={variant.geography} onValueChange={(value) => handleVariantChange(index, 'geography', value)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{geographyOptions.map(geo => <SelectItem key={geo} value={geo}>{geo}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Price (£) *</Label>
                                            <Input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)} required />
                                        </div>
                                        <div>
                                            <Label>Duration</Label>
                                            <Input value={variant.duration} onChange={(e) => handleVariantChange(index, 'duration', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Delivery Format</Label>
                                        <div className="flex gap-4 mt-2">
                                            {formatOptions.map(format => (
                                                <div key={format} className="flex items-center space-x-2">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`format-${index}-${format}`} 
                                                        checked={(variant.format || []).includes(format)} 
                                                        onChange={() => handleFormatChange(index, format)}
                                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <Label htmlFor={`format-${index}-${format}`} className="font-normal">{format}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Objectives */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg border-b pb-2">Learning Objectives</h3>
                        <div className="flex gap-2">
                            <Input value={newObjective} onChange={(e) => setNewObjective(e.target.value)} placeholder="Add objective..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('objectives', newObjective, setNewObjective))} />
                            <Button type="button" onClick={() => addListItem('objectives', newObjective, setNewObjective)}><Plus className="w-4 h-4" /></Button>
                        </div>
                        <div className="space-y-2">{formData.objectives.map((item, index) => <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded"><span>{item}</span><Button type="button" variant="ghost" size="sm" onClick={() => removeListItem('objectives', index)}><X className="w-4 h-4" /></Button></div>)}</div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg border-b pb-2">Key Benefits</h3>
                        <div className="flex gap-2">
                            <Input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} placeholder="Add benefit..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('benefits', newBenefit, setNewBenefit))} />
                            <Button type="button" onClick={() => addListItem('benefits', newBenefit, setNewBenefit)}><Plus className="w-4 h-4" /></Button>
                        </div>
                        <div className="space-y-2">{formData.benefits.map((item, index) => <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded"><span>{item}</span><Button type="button" variant="ghost" size="sm" onClick={() => removeListItem('benefits', index)}><X className="w-4 h-4" /></Button></div>)}</div>
                    </div>

                    {/* FAQ */}
                     <div className="space-y-2">
                        <h3 className="font-semibold text-lg border-b pb-2">FAQ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} placeholder="Question..." />
                            <div className="flex gap-2">
                                <Textarea value={newFaqAnswer} onChange={(e) => setNewFaqAnswer(e.target.value)} placeholder="Answer..." className="flex-1" />
                                <Button type="button" onClick={addFaq}><Plus className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        <div className="space-y-2">{formData.faq.map((item, index) => <div key={index} className="flex items-start justify-between bg-slate-50 p-2 rounded"><div><p className="font-semibold">{item.question}</p><p className="text-sm text-slate-600">{item.answer}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => removeListItem('faq', index)}><X className="w-4 h-4" /></Button></div>)}</div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : null}
                            {!isSubmitting && (courseToEdit ? 'Save Changes' : 'Create Course')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}