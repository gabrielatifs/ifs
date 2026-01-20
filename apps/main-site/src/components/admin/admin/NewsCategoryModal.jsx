import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ifs/shared/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { ifs } from '@ifs/shared/api/ifsClient';
import { useToast } from '@ifs/shared/components/ui/use-toast';

export default function NewsCategoryModal({ open, onOpenChange, categoryToEdit, onSave }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        displayOrder: '0',
        subCategories: ''
    });

    useEffect(() => {
        if (categoryToEdit) {
            setFormData({
                name: categoryToEdit.name || '',
                description: categoryToEdit.description || '',
                displayOrder: (categoryToEdit.displayOrder || 0).toString(),
                subCategories: Array.isArray(categoryToEdit.subCategories) ? categoryToEdit.subCategories.join('\n') : ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                displayOrder: '0',
                subCategories: ''
            });
        }
    }, [categoryToEdit, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                ...formData,
                displayOrder: parseInt(formData.displayOrder) || 0,
                subCategories: formData.subCategories.split('\n').map(s => s.trim()).filter(s => s.length > 0)
            };

            if (categoryToEdit) {
                await ifs.entities.NewsCategory.update(categoryToEdit.id, data);
                toast({ title: "Success", description: "Category updated successfully" });
            } else {
                await ifs.entities.NewsCategory.create(data);
                toast({ title: "Success", description: "Category created successfully" });
            }
            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving category:', error);
            toast({ 
                title: "Error", 
                description: error.message || "Failed to save category", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    <DialogDescription>
                        Manage news categories for the portal.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                            placeholder="e.g. Industry News"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            rows={3}
                            placeholder="Optional description for this category"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="subCategories">Sub Categories</Label>
                        <Textarea 
                            id="subCategories" 
                            value={formData.subCategories} 
                            onChange={(e) => setFormData({...formData, subCategories: e.target.value})} 
                            rows={4}
                            placeholder="One sub-category per line"
                        />
                        <p className="text-xs text-slate-500">Enter each sub-category on a new line.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="displayOrder">Display Order</Label>
                        <Input 
                            id="displayOrder" 
                            type="number"
                            value={formData.displayOrder} 
                            onChange={(e) => setFormData({...formData, displayOrder: e.target.value})} 
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {categoryToEdit ? 'Update Category' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}