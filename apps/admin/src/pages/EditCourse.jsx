import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Course } from '@ifs/shared/api/entities';
import { CourseVariant } from '@ifs/shared/api/entities';
import { Input } from '@ifs/shared/components/ui/input';
import { Button } from '@ifs/shared/components/ui/button';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ifs/shared/components/ui/card';
import { Loader2, Save, Trash2, PlusCircle, ArrowLeft, Upload, X } from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { createPageUrl, navigateToUrl } from '@ifs/shared/utils';
import { syncCourseWithStripe } from '@ifs/shared/api/functions';
import { UploadFile } from '@ifs/shared/api/integrations'; // CORRECTED IMPORT
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
import { useUser } from '@ifs/shared/components/providers/UserProvider';


// Helper to handle both string and array for FAQ
const parseFaq = (faq) => {
    if (!faq) return [];
    if (typeof faq === 'string') {
        try {
            const parsed = JSON.parse(faq);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return faq;
};


export default function EditCourse() {
    const { user, loading: userLoading } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [course, setCourse] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // State for image upload
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [variantToDelete, setVariantToDelete] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // For course deletion
    const [isDeleting, setIsDeleting] = useState(false); // For course deletion

    const fileInputRef = useRef(null); // Ref for file input

    const queryParams = new URLSearchParams(location.search);
    const courseId = queryParams.get('id');

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== 'admin') {
            navigate(createPageUrl('Dashboard'));
            return;
        }

        const fetchCourse = async () => {
            if (courseId) {
                try {
                    const [fetchedCourse, fetchedVariants] = await Promise.all([
                        Course.get(courseId),
                        CourseVariant.filter({ courseId: courseId })
                    ]);
                    setCourse({ ...fetchedCourse, faq: parseFaq(fetchedCourse.faq) });
                    setVariants(fetchedVariants);
                } catch (error) {
                    console.error("Error fetching course data:", error);
                    toast({ title: 'Error', description: 'Failed to load course data.', variant: 'destructive' });
                }
            } else {
                setCourse({
                    level: 'Foundation',
                    title: '',
                    description: '',
                    overview: '',
                    objectives: [],
                    benefits: [],
                    faq: [],
                    tags: [],
                    imageUrl: '',
                    certification: '',
                    price: 0,
                    creditCost: 0, // Added creditCost default
                    geography: [],
                    duration: '',
                    format: []
                });
            }
            setLoading(false);
        };
        fetchCourse();
    }, [courseId, user, userLoading, navigate, toast]);

    const handleCourseChange = (field, value) => {
        setCourse(prev => ({ ...prev, [field]: value }));
    };

    const handleListChange = (field, index, value) => {
        const list = [...(course[field] || [])];
        list[index] = value;
        handleCourseChange(field, list);
    };

    const addListItem = (field) => {
        const list = [...(course[field] || [])];
        list.push('');
        handleCourseChange(field, list);
    };

    const removeListItem = (field, index) => {
        const list = [...(course[field] || [])];
        list.splice(index, 1);
        handleCourseChange(field, list);
    };

    const handleFaqChange = (index, field, value) => {
        const updatedFaq = [...course.faq];
        updatedFaq[index][field] = value;
        handleCourseChange('faq', updatedFaq);
    };

    const addFaqItem = () => {
        if (newFaq.question && newFaq.answer) {
            handleCourseChange('faq', [...(course.faq || []), newFaq]);
            setNewFaq({ question: '', answer: '' });
        }
    };

    const removeFaqItem = (index) => {
        const updatedFaq = [...course.faq];
        updatedFaq.splice(index, 1);
        handleCourseChange('faq', updatedFaq);
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
    };

    const addVariant = () => {
        setVariants([...variants, {
            name: '',
            supportedGeographies: [],
            price: 0,
            creditCost: 0, // Added creditCost default for new variant
            duration: '',
            format: [],
            status: 'Available'
        }]);
    };

    const confirmDeleteVariant = (index) => {
        const variant = variants[index];
        if (variant.id) {
            setVariantToDelete({ ...variant, index });
        } else {
            removeVariant(index);
        }
    };
    
    const removeVariant = async (index, id = null) => {
        if (id) {
            try {
                await CourseVariant.delete(id);
                toast({ title: "Variant Deleted", description: "The variant has been permanently removed." });
            } catch (error) {
                console.error("Failed to delete variant from DB:", error);
                toast({ title: "Error", description: "Could not delete the variant.", variant: "destructive" });
                return; // Stop if DB deletion fails
            }
        }
        const updatedVariants = [...variants];
        updatedVariants.splice(index, 1);
        setVariants(updatedVariants);
        setVariantToDelete(null); // Close dialog
    };
    
    // New function to handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        toast({ title: 'Uploading image...', description: 'Please wait...' });
        try {
            // CORRECTED: Direct call to integration
            const { file_url } = await UploadFile({ file });
            
            if (file_url) {
                handleCourseChange('imageUrl', file_url);
            } else {
                throw new Error("Upload failed to return a URL.");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast({ title: 'Upload Failed', description: 'Could not upload the image. Please try again.', variant: 'destructive' });
        } finally {
            setIsUploading(false);
            // Clear the file input value so the same file can be re-uploaded if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = () => {
        handleCourseChange('imageUrl', '');
    };


    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            let savedCourseId = courseId;
            if (courseId) {
                await Course.update(courseId, course);
            } else {
                const newCourse = await Course.create(course);
                savedCourseId = newCourse.id;
            }

            for (const variant of variants) {
                if (variant.id) {
                    await CourseVariant.update(variant.id, { ...variant, courseId: savedCourseId });
                } else {
                    await CourseVariant.create({ ...variant, courseId: savedCourseId });
                }
            }

            toast({ title: 'Course Saved', description: 'All changes have been saved successfully.' });
            if (!courseId && savedCourseId) {
                navigate(createPageUrl('EditCourse') + `?id=${savedCourseId}`);
            }
        } catch (error) {
            console.error("Error saving course:", error);
            toast({ title: 'Save Failed', description: 'Could not save your changes.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSyncWithStripe = async () => {
        if (!courseId) {
            toast({ title: "Save Required", description: "Please save the course before syncing with Stripe.", variant: "destructive" });
            return;
        }
        setIsSyncing(true);
        try {
            await handleSubmit(); // Save latest changes first
            const { data } = await syncCourseWithStripe({ courseId });
            if (data.success) {
                toast({ title: "Sync Successful", description: "Course and variants are now synced with Stripe." });
                // Re-fetch data to get new Stripe IDs
                const fetchedVariants = await CourseVariant.filter({ courseId: courseId });
                setVariants(fetchedVariants);
            } else {
                throw new Error(data.details || "Syncing failed.");
            }
        } catch (error) {
            console.error("Stripe sync error:", error);
            toast({ title: "Sync Failed", description: `Could not sync with Stripe: ${error.message}`, variant: "destructive" });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!courseId) return; // Should not be possible to delete a course that hasn't been saved yet
        setIsDeleting(true);
        try {
            // First, delete all associated variants
            // The variants state should already be populated from the initial fetch.
            await Promise.all(variants.map(variant => CourseVariant.delete(variant.id)));
    
            // Then, delete the course itself
            await Course.delete(courseId);
    
            toast({
                title: "Course Deleted",
                description: `The course "${course?.title || 'Unknown Course'}" and its variants have been permanently removed.`,
            });
            navigateToUrl(navigate, createPageUrl('AdminDashboard')); // Redirect after deletion
        } catch (error) {
            console.error("Failed to delete course:", error);
            toast({
                title: "Deletion Failed",
                description: "Could not delete the course. Please try again. " + error.message,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };


    if (loading || userLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!user) return null; // Should be handled by redirect

    return (
        <div className="bg-slate-50 min-h-screen">
            <Toaster />
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course "{course?.title}" and all of its associated variants.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourse}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, delete course
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {variantToDelete && (
                <AlertDialog open={!!variantToDelete} onOpenChange={() => setVariantToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the variant "{variantToDelete?.name}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => removeVariant(variantToDelete.index, variantToDelete.id)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Yes, Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <Button variant="ghost" asChild>
                        <Link to={createPageUrl('AdminDashboard')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{courseId ? 'Edit Course' : 'Create New Course'}</CardTitle>
                            <CardDescription>Manage course details, content, and variants.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="title">Course Title</Label>
                                    <Input id="title" value={course?.title || ''} onChange={(e) => handleCourseChange('title', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="level">Level</Label>
                                    <Select value={course?.level} onValueChange={(value) => handleCourseChange('level', value)}>
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
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="price">Default Price (£)</Label>
                                        <Input id="price" type="number" value={course?.price || 0} onChange={(e) => handleCourseChange('price', parseFloat(e.target.value) || 0)} />
                                        <p className="text-sm text-slate-500 mt-1">Monetary price when no variants are defined.</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="creditCost">Credit Cost</Label>
                                        <Input id="creditCost" type="number" value={course?.creditCost || 0} onChange={(e) => handleCourseChange('creditCost', parseFloat(e.target.value) || 0)} />
                                        <p className="text-sm text-slate-500 mt-1">Credits required to book (250 = 1 hour CPD).</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea id="description" value={course?.description || ''} onChange={(e) => handleCourseChange('description', e.target.value)} />
                            </div>
                            
                            <div>
                                <Label>Course Image</Label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-48 h-32 bg-slate-100 rounded-lg border-2 border-dashed flex items-center justify-center relative group">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-400"/>
                                        ) : course?.imageUrl ? (
                                            <>
                                                <img src={course.imageUrl} alt="Course preview" className="w-full h-full object-cover rounded-md" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                    <Button variant="destructive" size="icon" onClick={handleRemoveImage}>
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
                                            {course?.imageUrl ? 'Change Image' : 'Upload Image'}
                                        </Button>
                                        <Input 
                                            ref={fileInputRef}
                                            id="image-upload" 
                                            type="file" 
                                            className="hidden" 
                                            onChange={handleImageUpload} 
                                            accept="image/png, image/jpeg, image/gif" 
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Recommended size: 1200x675px. Accepts JPG, PNG, GIF.</p>
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
                                                 onClick={() => pdfInputRef.current?.click()}
                                                 disabled={isUploading}
                                             >
                                                 <Upload className="w-4 h-4 mr-2" />
                                                 {course?.prospectusUrl ? 'Change Prospectus' : 'Upload Prospectus'}
                                             </Button>
                                             {course?.prospectusUrl && (
                                                 <Button variant="destructive" size="icon" onClick={() => handleCourseChange('prospectusUrl', '')}>
                                                     <Trash2 className="w-4 h-4" />
                                                 </Button>
                                             )}
                                         </div>
                                         <Input 
                                             ref={pdfInputRef}
                                             id="pdf-upload" 
                                             type="file" 
                                             className="hidden" 
                                             onChange={async (e) => {
                                                 const file = e.target.files[0];
                                                 if (!file) return;
                                                 setIsUploading(true);
                                                 toast({ title: 'Uploading PDF...', description: 'Please wait...' });
                                                 try {
                                                     const { file_url } = await UploadFile({ file });
                                                     if (file_url) {
                                                         handleCourseChange('prospectusUrl', file_url);
                                                         toast({ title: 'Success', description: 'Prospectus uploaded.' });
                                                     } else {
                                                         throw new Error("Upload failed.");
                                                     }
                                                 } catch (error) {
                                                     console.error("PDF upload error:", error);
                                                     toast({ title: 'Upload Failed', description: 'Could not upload the PDF.', variant: 'destructive' });
                                                 } finally {
                                                     setIsUploading(false);
                                                     if (pdfInputRef.current) pdfInputRef.current.value = "";
                                                 }
                                             }} 
                                             accept="application/pdf" 
                                         />
                                         {course?.prospectusUrl && (
                                             <p className="text-xs text-green-600 mt-2 flex items-center">
                                                 <CheckCircleIcon className="w-3 h-3 mr-1" /> Prospectus uploaded
                                             </p>
                                         )}
                                        </div>
                                        </div>
                                        </div>
                            
                            <div>
                                <Label htmlFor="overview">Overview</Label>
                                <Textarea id="overview" value={course?.overview || ''} onChange={(e) => handleCourseChange('overview', e.target.value)} rows={5} />
                            </div>

                            <div>
                                <Label>Learning Objectives</Label>
                                {(course?.objectives || []).map((obj, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2">
                                        <Input value={obj} onChange={(e) => handleListChange('objectives', i, e.target.value)} />
                                        <Button variant="ghost" size="icon" onClick={() => removeListItem('objectives', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addListItem('objectives')}><PlusCircle className="w-4 h-4 mr-2" />Add Objective</Button>
                            </div>

                            <div>
                                <Label>Participant Benefits</Label>
                                {(course?.benefits || []).map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2">
                                        <Input value={benefit} onChange={(e) => handleListChange('benefits', i, e.target.value)} />
                                        <Button variant="ghost" size="icon" onClick={() => removeListItem('benefits', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addListItem('benefits')}><PlusCircle className="w-4 h-4 mr-2" />Add Benefit</Button>
                            </div>
                            
                             <div>
                                <Label>Tags</Label>
                                <Input 
                                    placeholder="e.g., Education, DSL, Health"
                                    value={(course?.tags || []).join(', ')} 
                                    onChange={(e) => handleCourseChange('tags', e.target.value.split(',').map(tag => tag.trim()))} 
                                />
                                <p className="text-sm text-slate-500 mt-1">Separate tags with a comma.</p>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-between items-center bg-slate-50 p-6 rounded-b-lg">
                            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={!courseId || isSaving || isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Course
                            </Button>
                            <div className="flex items-center gap-4">
                                {courseId && (
                                     <Button variant="outline" onClick={handleSyncWithStripe} disabled={isSaving || isSyncing}>
                                        {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Sync with Stripe
                                    </Button>
                                )}
                                <Button onClick={handleSubmit} disabled={isSaving || isSyncing}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>FAQ</CardTitle>
                            <CardDescription>Manage frequently asked questions for this course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(course?.faq || []).map((faq, i) => (
                                <div key={i} className="p-4 border rounded-md space-y-2 relative">
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeFaqItem(i)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                    <div>
                                        <Label>Question</Label>
                                        <Input value={faq.question} onChange={(e) => handleFaqChange(i, 'question', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Answer</Label>
                                        <Textarea value={faq.answer} onChange={(e) => handleFaqChange(i, 'answer', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 border border-dashed rounded-md space-y-2 bg-slate-50">
                                <h4 className="font-semibold text-slate-700">Add New FAQ</h4>
                                <div>
                                    <Label>Question</Label>
                                    <Input value={newFaq.question} onChange={(e) => setNewFaq(p => ({...p, question: e.target.value}))} />
                                </div>
                                <div>
                                    <Label>Answer</Label>
                                    <Textarea value={newFaq.answer} onChange={(e) => setNewFaq(p => ({...p, answer: e.target.value}))} />
                                </div>
                                <Button variant="outline" size="sm" onClick={addFaqItem} disabled={!newFaq.question || !newFaq.answer}>
                                    <PlusCircle className="w-4 h-4 mr-2" />Add FAQ Item
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Variants</CardTitle>
                            <CardDescription>Define different versions of this course, e.g., for different geographies or formats.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {variants.map((variant, index) => (
                                <div key={index} className="p-6 border rounded-lg bg-white relative">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => confirmDeleteVariant(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                    <h3 className="font-semibold text-lg mb-4">Variant #{index + 1}</h3>
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
                                            <Label>Credit Cost</Label>
                                            <Input 
                                                type="number" 
                                                value={variant.creditCost || 0} 
                                                onChange={(e) => handleVariantChange(index, 'creditCost', parseFloat(e.target.value) || 0)} 
                                                placeholder="e.g., 250, 500"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">250 credits = 1 hour CPD</p>
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
                                            <Label>Duration</Label>
                                            <Input value={variant.duration} onChange={(e) => handleVariantChange(index, 'duration', e.target.value)} placeholder="e.g., 4 hours, Full Day"/>
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
                                        {variant.stripePriceId && (
                                            <div className="md:col-span-2 text-xs text-slate-500 bg-slate-100 p-2 rounded">
                                                Stripe Price ID: {variant.stripePriceId}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={addVariant}><PlusCircle className="w-4 h-4 mr-2" />Add Variant</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
