import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Edit2, Upload, X, Loader2 } from 'lucide-react';
import { useAdminMode } from '../providers/AdminModeProvider';
import { useUser } from '../providers/UserProvider';
import { UploadFile } from '@/api/integrations';
import { MarketingContent } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { createPageUrl } from '@/utils';

export default function ServiceCard({ 
    content,
    onUpdate
}) {
    const { user } = useUser();
    const { isAdminMode } = useAdminMode();
    const { toast } = useToast();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editedContent, setEditedContent] = useState(content || {});
    const [imageError, setImageError] = useState(false);
    
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const isAdmin = user?.role === 'admin';

    React.useEffect(() => {
        if (content) {
            setEditedContent(content);
        }
    }, [content]);

    if (!content) {
        return (
            <div className="group bg-gray-100 rounded-xl shadow-sm flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ title: "Invalid File Type", description: "Please select an image file.", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setEditedContent(prev => ({ ...prev, imageUrl: file_url }));
            toast({ title: "Image Uploaded", description: "Image URL has been updated." });
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({ title: "Upload Failed", description: "Failed to upload image. Please try again.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const { id, created_date, updated_date, created_by, ...updateData } = editedContent;
            await MarketingContent.update(id, updateData);
            if (onUpdate) {
                onUpdate();
            }
            setIsEditModalOpen(false);
            toast({ title: "Content Updated", description: "The service card has been updated successfully." });
        } catch (error) {
            console.error("Failed to save content:", error);
            toast({ title: "Save Failed", description: "Could not save changes. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditedContent(content);
        setIsEditModalOpen(true);
    };

    const cardContent = (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full relative">
            {isAdminMode && isAdmin && (
                <div className="absolute top-2 right-2 z-10">
                    <Button
                        onClick={handleEditClick}
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                </div>
            )}
            
            <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                {!imageError && content.imageUrl ? (
                    <img 
                        src={content.imageUrl} 
                        alt={content.title || 'Service'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-400">No image</span>
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-black mb-3">{content.title || 'Service Title'}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{content.description || 'Service description'}</p>
                </div>
                {content.linkTo && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            {content.linkText || "Learn More"} <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                    </div>
                )}
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Service Card</DialogTitle>
                        <DialogDescription>Make changes to the card's content. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={editedContent.title || ''}
                                onChange={(e) => setEditedContent(prev => ({...prev, title: e.target.value}))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editedContent.description || ''}
                                onChange={(e) => setEditedContent(prev => ({...prev, description: e.target.value}))}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                            {editedContent.imageUrl && (
                                <div className="relative w-fit">
                                    <img src={editedContent.imageUrl} alt="Preview" className="w-32 h-20 object-cover rounded border" />
                                    <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 p-0" onClick={() => setEditedContent(prev => ({ ...prev, imageUrl: '' }))}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                            <Input
                                placeholder="Paste image URL..."
                                value={editedContent.imageUrl || ''}
                                onChange={(e) => setEditedContent(prev => ({...prev, imageUrl: e.target.value}))}
                                className="mb-2"
                            />
                             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
                                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Image</>}
                            </Button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );

    if (content.linkTo && !isAdminMode) {
        return (
            <Link to={createPageUrl(content.linkTo)} className="h-full">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}