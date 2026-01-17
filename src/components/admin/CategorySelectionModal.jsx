
import React, { useState, useEffect, useCallback } from 'react';
import { CourseCategory } from '@/api/entities/CourseCategory';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CategorySelectionModal({ isOpen, onClose, selectedCategory, onCategorySelect }) {
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [tempSelected, setTempSelected] = useState(selectedCategory || '');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedCategories = await CourseCategory.list();
            setCategories(fetchedCategories.map(c => c.name));
        } catch (error) {
            toast({ title: 'Error', description: 'Could not load categories.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            setTempSelected(selectedCategory);
        }
    }, [isOpen, selectedCategory, fetchCategories]);

    const handleAddCategory = async () => {
        if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
            const newCategory = newCategoryName.trim();
            try {
                await CourseCategory.create({ name: newCategory });
                setCategories(prev => [...prev, newCategory]);
                setTempSelected(newCategory);
                setNewCategoryName('');
                toast({ title: "Category Created", description: `"${newCategory}" has been added.` });
            } catch (error) {
                toast({ title: 'Error', description: 'Could not create category.', variant: 'destructive' });
            }
        }
    };

    const handleConfirm = () => {
        onCategorySelect(tempSelected);
        onClose();
    };

    const handleClose = () => {
        setTempSelected(selectedCategory || '');
        setNewCategoryName('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select Course Category</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        <div>
                            <Label className="text-base font-medium">Choose from existing categories:</Label>
                            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                {categories.map((category) => (
                                    <div
                                        key={category}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${tempSelected === category ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                                        onClick={() => setTempSelected(category)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{category}</span>
                                            {tempSelected === category && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="border-t pt-6">
                        <Label className="text-base font-medium">Or create a new category:</Label>
                        <div className="mt-3 flex gap-3">
                            <Input placeholder="Enter new category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()} className="flex-1" />
                            <Button type="button" onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="bg-green-600 hover:bg-green-700">
                                <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>
                        </div>
                    </div>
                    {tempSelected && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <Label className="text-sm font-medium text-blue-800">Selected Category:</Label>
                            <Badge className="mt-2 bg-blue-600 text-white">{tempSelected}</Badge>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="button" onClick={handleConfirm} disabled={!tempSelected} className="bg-blue-600 hover:bg-blue-700">
                        Select Category
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
