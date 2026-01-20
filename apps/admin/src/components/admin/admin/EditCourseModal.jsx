import React, { useState, useEffect, useRef } from 'react';
import { Course } from '@ifs/shared/api/entities';
import { CourseVariant } from '@ifs/shared/api/entities';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@ifs/shared/components/ui/dialog';
import { useToast } from '@ifs/shared/components/ui/use-toast';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';

export default function EditCourseModal({ isOpen, onClose, courseToEdit, onCourseSaved }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [variants, setVariants] = useState([]);
    const fileInputRef = useRef(null);

    const [course, setCourse] = useState({
        title: '',
        level: 'Foundation',
        description: '',
        imageUrl: '',
        prospectusUrl: '',
        overview: '',
        objectives: [],
        benefits: [],
        faq: [],
        tags: [],
        price: 0,
        cpdHours: 0,
        duration: '',
    });

    useEffect(() => {
        if (isOpen && courseToEdit) {
            setCourse({
                title: courseToEdit.title || '',
                level: courseToEdit.level || 'Foundation',
                description: courseToEdit.description || '',
                imageUrl: courseToEdit.imageUrl || '',
                prospectusUrl: courseToEdit.prospectusUrl || '',
                overview: courseToEdit.overview || '',
                objectives: courseToEdit.objectives || [],
                benefits: courseToEdit.benefits || [],
                faq: courseToEdit.faq || [],
                tags: courseToEdit.tags || [],
                price: courseToEdit.price || 0,
                cpdHours: courseToEdit.cpdHours || 0,
                duration: courseToEdit.duration || '',
            });
            
            loadVariants(courseToEdit.id);
        } else if (isOpen && !courseToEdit) {
            resetForm();
        }
    }, [isOpen, courseToEdit]);

    const resetForm = () => {
        setCourse({
            title: '',
            level: 'Foundation',
            description: '',
            imageUrl: '',
            prospectusUrl: '',
            overview: '',
            objectives: [],
            benefits: [],
            faq: [],
            tags: [],
            price: 0,
            cpdHours: 0,
            duration: '',
        });
        setVariants([]);
    };

    const loadVariants = async (courseId) => {
        try {
            const fetchedVariants = await CourseVariant.filter({ courseId });
            setVariants(fetchedVariants || []);
        } catch (error) {
            console.error('Failed to load variants:', error);
            toast({ title: 'Error', description: 'Failed to load course variants', variant: 'destructive' });
        }
    };

    const handleCourseChange = (field, value) => {
        setCourse(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, value) => {
        const arr = value.split('\n').filter(item => item.trim());
        setCourse(prev => ({ ...prev, [field]: arr }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { ifs } = await import('@/api/ifsClient');
            const { file_url } = await ifs.integrations.Core.UploadFile({ file });
            handleCourseChange('imageUrl', file_url);
            toast({ title: 'Success', description: 'Image uploaded successfully' });
        } catch (error) {
            console.error('Image upload failed:', error);
            toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        handleCourseChange('imageUrl', '');
    };

    const handleProspectusUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { ifs } = await import('@/api/ifsClient');
            const { file_url } = await ifs.integrations.Core.UploadFile({ file });
            handleCourseChange('prospectusUrl', file_url);
            toast({ title: 'Success', description: 'Prospectus uploaded successfully' });
        } catch (error) {
            console.error('Prospectus upload failed:', error);
            toast({ title: 'Error', description: 'Failed to upload prospectus', variant: 'destructive' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveProspectus = () => {
        handleCourseChange('prospectusUrl', '');
    };

    const addVariant = () => {
        const newVariant = {
            name: '',
            price: 0,
            cpdHours: 0,
            supportedGeographies: [],
            duration: '',
            format: [],
            status: 'Available',
            isNew: true
        };
        setVariants([...variants, newVariant]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const courseData = { ...course };

            let savedCourse;
            if (courseToEdit) {
                await Course.update(courseToEdit.id, courseData);
                savedCourse = { ...courseToEdit, ...courseData };
                toast({ title: 'Success', description: 'Course updated successfully' });
            } else {
                savedCourse = await Course.create(courseData);
                toast({ title: 'Success', description: 'Course created successfully' });
            }

            // Save variants
            for (const variant of variants) {
                const variantData = { ...variant, courseId: savedCourse.id };
                delete variantData.isNew;
                delete variantData.cpdHours;

                if (variant.id) {
                    await CourseVariant.update(variant.id, variantData);
                } else {
                    await CourseVariant.create(variantData);
                }
            }

            onCourseSaved?.();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Failed to save course:', error);
            toast({ title: 'Error', description: `Failed to save course: ${error.message}`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{courseToEdit ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                    <DialogDescription>
                        {courseToEdit ? 'Update course details and variants' : 'Create a new training course with pricing and variants'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="title">Course Title</Label>
                                    <Input id="title" value={course.title} onChange={(e) => handleCourseChange('title', e.target.value)} required />
                                </div>
                                <div>
                                    <Label htmlFor="level">Level</Label>
                                    <Select value={course.level} onValueChange={(value) => handleCourseChange('level', value)}>
                                        <SelectTrigger id="level"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Foundation">Foundation</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                            <SelectItem value="Refresher">Refresher</SelectItem>
                                            <SelectItem value="Short & Specialist">Short & Specialist</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {variants.length === 0 && (
                                <>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <Label htmlFor="price">Default Price (£)</Label>
                                            <Input id="price" type="number" value={course.price} onChange={(e) => handleCourseChange('price', parseFloat(e.target.value) || 0)} />
                                            <p className="text-sm text-slate-500 mt-1">Monetary price when no variants are defined.</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="cpdHours">CPD Hours</Label>
                                            <Input id="cpdHours" type="number" step="0.1" value={course.cpdHours} onChange={(e) => handleCourseChange('cpdHours', parseFloat(e.target.value) || 0)} />
                                            <p className="text-sm text-slate-500 mt-1">Course duration in hours (1 hour ≈ £30 discount).</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="duration">Duration</Label>
                                            <Input 
                                                id="duration"
                                                value={course.duration}
                                                onChange={(e) => handleCourseChange('duration', e.target.value)}
                                                placeholder="e.g., 4 hours, Full Day, 2 days"
                                            />
                                            <p className="text-sm text-slate-500 mt-1">Length of the course</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea id="description" value={course.description} onChange={(e) => handleCourseChange('description', e.target.value)} />
                            </div>
                            
                            <div>
                                <Label>Course Image</Label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-48 h-32 bg-slate-100 rounded-lg border-2 border-dashed flex items-center justify-center relative group">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-400"/>
                                        ) : course.imageUrl ? (
                                            <>
                                                <img src={course.imageUrl} alt="Course preview" className="w-full h-full object-cover rounded-md" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                    <Button type="button" variant="destructive" size="icon" onClick={handleRemoveImage}>
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto w-8 h-8 text-slate-400 mb-1" />
                                                <span className="text-sm text-slate-500">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            className="w-full" 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {course.imageUrl ? 'Change Image' : 'Upload Image'}
                                        </Button>
                                        <Input 
                                            ref={fileInputRef}
                                            id="image-upload" 
                                            type="file" 
                                            className="hidden" 
                                            onChange={handleImageUpload} 
                                            accept="image/png, image/jpeg, image/gif" 
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Recommended: 1200x675px. JPG, PNG, GIF.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Course Prospectus (PDF)</Label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex gap-2">
                                            <Button 
                                                type="button"
                                                variant="outline" 
                                                className="w-full" 
                                                onClick={() => document.getElementById('prospectus-upload').click()}
                                                disabled={isUploading}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {course.prospectusUrl ? 'Change Prospectus' : 'Upload Prospectus'}
                                            </Button>
                                            {course.prospectusUrl && (
                                                <Button type="button" variant="destructive" size="icon" onClick={handleRemoveProspectus}>
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                        <Input 
                                            id="prospectus-upload" 
                                            type="file" 
                                            className="hidden" 
                                            onChange={handleProspectusUpload} 
                                            accept="application/pdf" 
                                        />
                                        {course.prospectusUrl && (
                                            <p className="text-xs text-green-600 mt-2">Prospectus uploaded.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="overview">Overview</Label>
                                <Textarea id="overview" value={course.overview} onChange={(e) => handleCourseChange('overview', e.target.value)} rows={4} />
                            </div>

                            <div>
                                <Label htmlFor="objectives">Learning Objectives (one per line)</Label>
                                <Textarea 
                                    id="objectives" 
                                    value={course.objectives?.join('\n') || ''} 
                                    onChange={(e) => handleArrayChange('objectives', e.target.value)} 
                                    rows={4}
                                    placeholder="Understand key concepts&#10;Apply best practices&#10;Develop practical skills"
                                />
                            </div>

                            <div>
                                <Label htmlFor="benefits">Key Benefits (one per line)</Label>
                                <Textarea 
                                    id="benefits" 
                                    value={course.benefits?.join('\n') || ''} 
                                    onChange={(e) => handleArrayChange('benefits', e.target.value)} 
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input 
                                    id="tags" 
                                    value={course.tags?.join(', ') || ''} 
                                    onChange={(e) => handleCourseChange('tags', e.target.value.split(',').map(t => t.trim()))} 
                                    placeholder="DSL, Safeguarding, Education"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Variants Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Course Variants</CardTitle>
                                <Button type="button" onClick={addVariant} variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-2" /> Add Variant
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {variants.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No variants. Click "Add Variant" to create different versions (e.g., Online, In-Person).</p>
                            ) : (
                                variants.map((variant, index) => (
                                    <Card key={index} className="border-2">
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold text-lg">Variant #{index + 1}</h3>
                                                <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(index)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Variant Name</Label>
                                                    <Input value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} placeholder="e.g., Online Live, In-Person" />
                                                </div>
                                                <div>
                                                    <Label>Price (£)</Label>
                                                    <Input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div>
                                                    <Label>CPD Hours</Label>
                                                    <Input 
                                                        type="number"
                                                        step="0.1"
                                                        value={variant.cpdHours || 0} 
                                                        onChange={(e) => handleVariantChange(index, 'cpdHours', parseFloat(e.target.value) || 0)} 
                                                        placeholder="e.g., 1, 2.5, 4"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Course duration in hours (1 hour ≈ £30 discount)</p>
                                                </div>
                                                <div>
                                                    <Label>Duration</Label>
                                                    <Input 
                                                        value={variant.duration || ''}
                                                        onChange={(e) => handleVariantChange(index, 'duration', e.target.value)}
                                                        placeholder="e.g., 4 hours, Full Day"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Supported Geographies</Label>
                                                    <Input 
                                                        placeholder="e.g., England, UK-Wide"
                                                        value={(variant.supportedGeographies || []).join(', ')} 
                                                        onChange={(e) => handleVariantChange(index, 'supportedGeographies', e.target.value.split(',').map(g => g.trim()))} 
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Format</Label>
                                                    <Input 
                                                        placeholder="e.g., Online, In Person"
                                                        value={(variant.format || []).join(', ')} 
                                                        onChange={(e) => handleVariantChange(index, 'format', e.target.value.split(',').map(f => f.trim()))} 
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Status</Label>
                                                    <Select value={variant.status} onValueChange={(value) => handleVariantChange(index, 'status', value)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Available">Available</SelectItem>
                                                            <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                                                            <SelectItem value="Full">Full</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                courseToEdit ? 'Update Course' : 'Create Course'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
