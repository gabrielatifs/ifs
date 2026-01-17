import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { NewsSource } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';

export default function NewsSourceModal({ open, onOpenChange, sourceToEdit, onSave }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'RSS',
        url: '',
        fetchIntervalMinutes: '60',
        status: 'Active'
    });
    const [parserConfigJson, setParserConfigJson] = useState('{\n  "rootPath": "",\n  "fields": {\n    "title": "title",\n    "summary": "summary",\n    "sourceUrl": "url",\n    "publishedDate": "date",\n    "imageUrl": "image"\n  }\n}');

    useEffect(() => {
        if (sourceToEdit) {
            setFormData({
                name: sourceToEdit.name || '',
                type: sourceToEdit.type || 'RSS',
                url: sourceToEdit.url || '',
                apiKeySecretName: sourceToEdit.apiKeySecretName || '',
                fetchIntervalMinutes: (sourceToEdit.fetchIntervalMinutes || 60).toString(),
                status: sourceToEdit.status || 'Active'
            });
            if (sourceToEdit.parserConfig) {
                setParserConfigJson(JSON.stringify(sourceToEdit.parserConfig, null, 2));
            } else {
                setParserConfigJson('{\n  "auth": {\n    "header": "Authorization",\n    "valuePrefix": "Bearer "\n  },\n  "rootPath": "",\n  "fields": {\n    "title": "title",\n    "summary": "summary",\n    "sourceUrl": "url",\n    "publishedDate": "date",\n    "imageUrl": "image"\n  }\n}');
            }
        } else {
            setFormData({
                name: '',
                type: 'RSS',
                url: '',
                apiKeySecretName: '',
                fetchIntervalMinutes: '60',
                status: 'Active'
            });
            setParserConfigJson('{\n  "auth": {\n    "header": "Authorization",\n    "valuePrefix": "Bearer "\n  },\n  "rootPath": "",\n  "fields": {\n    "title": "title",\n    "summary": "summary",\n    "sourceUrl": "url",\n    "publishedDate": "date",\n    "imageUrl": "image"\n  }\n}');
        }
    }, [sourceToEdit, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let parsedConfig = {};
            if (formData.type === 'API') {
                try {
                    parsedConfig = JSON.parse(parserConfigJson);
                } catch (e) {
                    throw new Error("Invalid JSON in Parser Config");
                }
            }

            const data = {
                ...formData,
                fetchIntervalMinutes: parseInt(formData.fetchIntervalMinutes),
                parserConfig: formData.type === 'API' ? parsedConfig : {}
            };

            if (sourceToEdit) {
                await NewsSource.update(sourceToEdit.id, data);
                toast({ title: "Success", description: "News source updated successfully" });
            } else {
                await NewsSource.create(data);
                toast({ title: "Success", description: "News source created successfully" });
            }
            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving news source:', error);
            toast({ 
                title: "Error", 
                description: error.message || "Failed to save news source", 
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
                    <DialogTitle>{sourceToEdit ? 'Edit News Source' : 'Add News Source'}</DialogTitle>
                    <DialogDescription>
                        Configure a source to automatically pull news from.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Source Name</Label>
                        <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="e.g. BBC Technology"
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(value) => setFormData({...formData, type: value})}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RSS">RSS Feed</SelectItem>
                                    <SelectItem value="API">API (JSON)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="interval">Fetch Interval (mins)</Label>
                            <Input 
                                id="interval" 
                                type="number" 
                                min="15"
                                value={formData.fetchIntervalMinutes} 
                                onChange={(e) => setFormData({...formData, fetchIntervalMinutes: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="url">URL</Label>
                        <Input 
                            id="url" 
                            value={formData.url} 
                            onChange={(e) => setFormData({...formData, url: e.target.value})} 
                            placeholder="https://example.com/feed.xml"
                            required 
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="apiKeySecretName">API Key Secret Name (Optional)</Label>
                        <Input 
                            id="apiKeySecretName" 
                            value={formData.apiKeySecretName || ''} 
                            onChange={(e) => setFormData({...formData, apiKeySecretName: e.target.value})} 
                            placeholder="e.g. GOOGLE_NEWS_API_KEY"
                        />
                        <p className="text-[10px] text-slate-500">
                            If set, the system will retrieve this secret value for authentication.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                            value={formData.status} 
                            onValueChange={(value) => setFormData({...formData, status: value})}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.type === 'API' && (
                        <div className="grid gap-2">
                            <Label htmlFor="parserConfig">Parser Config (JSON)</Label>
                            <textarea
                                id="parserConfig"
                                value={parserConfigJson}
                                onChange={(e) => setParserConfigJson(e.target.value)}
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                placeholder='{"rootPath": "articles", "fields": {"title": "title", ...}}'
                            />
                            <p className="text-[10px] text-slate-500">
                                <strong>Fields:</strong> Map using dot notation. <code>rootPath</code> finds the array.
                                <br />
                                <strong>Auth:</strong> Configure <code>auth</code> object with <code>header</code> (e.g. "X-Api-Key"), <code>valuePrefix</code> (optional), or <code>queryParam</code>.
                            </p>
                        </div>
                    )}
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {sourceToEdit ? 'Update Source' : 'Create Source'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}