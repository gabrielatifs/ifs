import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Checkbox } from '@ifs/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ifs/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ifs/shared/components/ui/tabs";
import { Loader2, Image as ImageIcon, Eye, Edit2, Calendar, Link as LinkIcon } from 'lucide-react';
import { NewsItem } from '@ifs/shared/api/entities';
import { useToast } from '@ifs/shared/components/ui/use-toast';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Card, CardContent } from '@ifs/shared/components/ui/card';
import { format } from 'date-fns';

export default function NewsArticleModal({ open, onOpenChange, articleToEdit, onSave, existingCategories = [] }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("edit");
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        sourceName: '',
        sourceUrl: '',
        imageUrl: '',
        status: 'Draft',
        publishedDate: new Date().toISOString().split('T')[0],
        displayOrder: '0',
        category: '',
        subCategory: '',
        isFeatured: false
    });

    useEffect(() => {
        if (articleToEdit) {
            setFormData({
                title: articleToEdit.title || '',
                summary: articleToEdit.summary || '',
                sourceName: articleToEdit.sourceName || '',
                sourceUrl: articleToEdit.sourceUrl || '',
                imageUrl: articleToEdit.imageUrl || '',
                status: articleToEdit.status || 'Draft',
                publishedDate: articleToEdit.publishedDate ? new Date(articleToEdit.publishedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                displayOrder: (articleToEdit.displayOrder || 0).toString(),
                category: articleToEdit.category || '',
                subCategory: articleToEdit.subCategory || '',
                isFeatured: articleToEdit.isFeatured || false
            });
        } else {
            setFormData({
                title: '',
                summary: '',
                sourceName: '',
                sourceUrl: '',
                imageUrl: '',
                status: 'Draft',
                publishedDate: new Date().toISOString().split('T')[0],
                displayOrder: '0',
                category: '',
                subCategory: '',
                isFeatured: false
            });
        }
    }, [articleToEdit, open]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                ...formData,
                displayOrder: parseInt(formData.displayOrder),
                publishedDate: new Date(formData.publishedDate).toISOString(),
                isFeatured: Boolean(formData.isFeatured)
            };

            let result;
            if (articleToEdit) {
                result = await NewsItem.update(articleToEdit.id, data);
                toast({ title: "Success", description: "Article updated successfully" });
            } else {
                result = await NewsItem.create(data);
                toast({ title: "Success", description: "Article created successfully" });
            }
            
            // Pass the actual result back to avoid full refetch
            // Base44 create returns { id: ... }, update returns null usually or the object depending on implementation
            // We'll reconstruct the object to be safe for the UI update if result is partial
            const savedItem = { ...data, id: articleToEdit?.id || result?.id, created_date: articleToEdit?.created_date || new Date().toISOString() };
            
            onSave(savedItem);
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving article:', error);
            toast({ 
                title: "Error", 
                description: error.message || "Failed to save article", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{articleToEdit ? 'Edit Article' : 'Add Article'}</DialogTitle>
                    <DialogDescription>
                        Curate news content for the portal. Use the tabs to switch between editing and preview.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                        </TabsTrigger>
                        <TabsTrigger value="preview">
                            <Eye className="w-4 h-4 mr-2" /> Preview Card
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-4 mt-4">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input 
                                        id="title" 
                                        value={formData.title} 
                                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                        placeholder="Article headline"
                                        className="font-medium"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(value) => setFormData({...formData, status: value})}
                                    >
                                        <SelectTrigger id="status" className={
                                            formData.status === 'Published' ? 'bg-green-50 border-green-200 text-green-900' : 
                                            formData.status === 'Draft' ? 'bg-slate-50 border-slate-200 text-slate-900' : 
                                            'bg-orange-50 border-orange-200 text-orange-900'
                                        }>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="summary">Summary</Label>
                                <Textarea 
                                    id="summary" 
                                    value={formData.summary} 
                                    onChange={(e) => setFormData({...formData, summary: e.target.value})} 
                                    rows={4}
                                    placeholder="Brief description of the article..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="imageUrl" 
                                            value={formData.imageUrl} 
                                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                                            placeholder="https://..."
                                        />
                                    </div>
                                    {formData.imageUrl && (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                                            <img 
                                                src={formData.imageUrl} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover"
                                                onError={(e) => e.target.style.display = 'none'} 
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sourceName">Source Name</Label>
                                        <Input 
                                            id="sourceName" 
                                            value={formData.sourceName} 
                                            onChange={(e) => setFormData({...formData, sourceName: e.target.value})} 
                                            placeholder="e.g. BBC News"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        {existingCategories.length > 0 ? (
                                            <Select 
                                                value={formData.category} 
                                                onValueChange={(value) => setFormData({...formData, category: value, subCategory: ''})}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {existingCategories.map(cat => (
                                                        <SelectItem key={cat.id || cat.name} value={cat.name}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input 
                                                id="category" 
                                                value={formData.category} 
                                                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                                                placeholder="e.g. Industry News"
                                            />
                                        )}
                                    </div>
                                    {formData.category && existingCategories.find(c => c.name === formData.category)?.subCategories?.length > 0 && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="subCategory">Sub Category</Label>
                                            <Select 
                                                value={formData.subCategory || ''} 
                                                onValueChange={(value) => setFormData({...formData, subCategory: value})}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select sub-category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {existingCategories.find(c => c.name === formData.category)?.subCategories?.map(sub => (
                                                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label htmlFor="publishedDate">Publication Date</Label>
                                        <Input 
                                            id="publishedDate" 
                                            type="date"
                                            value={formData.publishedDate} 
                                            onChange={(e) => setFormData({...formData, publishedDate: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sourceUrl">Source URL (Read More Link)</Label>
                                <Input 
                                    id="sourceUrl" 
                                    value={formData.sourceUrl} 
                                    onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})} 
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="isFeatured" 
                                        checked={formData.isFeatured} 
                                        onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})} 
                                    />
                                    <Label htmlFor="isFeatured" className="cursor-pointer font-medium">
                                        Featured Article
                                    </Label>
                                </div>
                                <div className="flex-1" />
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="displayOrder" className="text-slate-500">Sort Order:</Label>
                                    <Input 
                                        id="displayOrder" 
                                        type="number"
                                        value={formData.displayOrder} 
                                        onChange={(e) => setFormData({...formData, displayOrder: e.target.value})} 
                                        className="w-20 h-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                        <div className="flex justify-center bg-slate-100 p-8 rounded-lg border border-slate-200 min-h-[400px] items-center">
                            <Card className="w-full max-w-md overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                                    {formData.imageUrl ? (
                                        <img
                                            src={formData.imageUrl}
                                            alt={formData.title}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                                            <ImageIcon className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-white/90 text-purple-700 hover:bg-white backdrop-blur-sm border-none shadow-sm">
                                            {formData.category || 'News'}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-5">
                                    <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{formData.publishedDate ? format(new Date(formData.publishedDate), 'MMM d, yyyy') : 'Date'}</span>
                                        <span>•</span>
                                        <span>{formData.sourceName || 'Source'}</span>
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-2">
                                        {formData.title || 'Article Title'}
                                    </h3>
                                    <p className="mb-4 text-sm text-slate-600 line-clamp-3">
                                        {formData.summary || 'Article summary will appear here...'}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                            Read more <LinkIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => handleSubmit()} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {articleToEdit ? 'Update Article' : 'Create Article'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}