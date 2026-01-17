import React, { useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ifs/shared/components/ui/dialog';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";

export default function CommunityEventModal({ open, onOpenChange, event, onSave }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Forum',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        imageUrl: '',
        maxParticipants: '',
        status: 'Active',
        facilitator: '',
        targetAudience: 'All Members',
        meetingUrl: '',
        meetingPassword: '',
        meetingId: '',
        tags: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                description: event.description || '',
                type: event.type || 'Forum',
                date: event.date || '',
                startTime: event.startTime || '',
                endTime: event.endTime || '',
                location: event.location || '',
                latitude: event.latitude || null,
                longitude: event.longitude || null,
                imageUrl: event.imageUrl || '',
                maxParticipants: event.maxParticipants || '',
                status: event.status || 'Active',
                facilitator: event.facilitator || '',
                targetAudience: event.targetAudience || 'All Members',
                meetingUrl: event.meetingUrl || '',
                meetingPassword: event.meetingPassword || '',
                meetingId: event.meetingId || '',
                tags: event.tags || []
            });
        } else {
            setFormData({
                title: '',
                description: '',
                type: 'Forum',
                date: '',
                startTime: '',
                endTime: '',
                location: '',
                latitude: null,
                longitude: null,
                imageUrl: '',
                maxParticipants: '',
                status: 'Active',
                facilitator: '',
                targetAudience: 'All Members',
                meetingUrl: '',
                meetingPassword: '',
                meetingId: '',
                tags: []
            });
        }
    }, [event]);

    // Init Google Maps Autocomplete for Community Event
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                const input = document.getElementById('community-location-input');
                if (input && window.google && window.google.maps) {
                    const autocomplete = new window.google.maps.places.Autocomplete(input, {
                        fields: ['formatted_address', 'name', 'geometry'],
                    });
                    
                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.formatted_address || place.name) {
                            setFormData(prev => ({
                                ...prev,
                                location: place.formatted_address || place.name,
                                latitude: place.geometry?.location?.lat() || null,
                                longitude: place.geometry?.location?.lng() || null
                            }));
                        }
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.type || !formData.date || !formData.location) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (Title, Type, Date, Location)",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
            };

            if (event) {
                await base44.entities.CommunityEvent.update(event.id, dataToSave);
                toast({
                    title: "Event Updated",
                    description: "Community event has been updated successfully."
                });
            } else {
                await base44.entities.CommunityEvent.create(dataToSave);
                toast({
                    title: "Event Created",
                    description: "Community event has been created successfully."
                });
            }

            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save event:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to save event. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{event ? 'Edit Community Event' : 'Create Community Event'}</DialogTitle>
                    <DialogDescription>
                        {event ? 'Update the details of this community event' : 'Add a new community event for members'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Basic Information</h3>
                        
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g., Monthly Safeguarding Forum"
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe what this event is about..."
                                rows={4}
                                className="mt-1.5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">Event Type *</Label>
                                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Forum">Forum</SelectItem>
                                        <SelectItem value="Coffee Morning">Coffee Morning</SelectItem>
                                        <SelectItem value="Networking">Networking</SelectItem>
                                        <SelectItem value="Social">Social</SelectItem>
                                        <SelectItem value="Discussion Group">Discussion Group</SelectItem>
                                        <SelectItem value="Membership Information Sessions">Membership Information Sessions</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status">Status *</Label>
                                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Full">Full</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Date & Time</h3>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Location</h3>
                        
                        <div>
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="community-location-input"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="e.g., Online, London Office, Manchester (Search available)"
                                className="mt-1.5"
                            />
                        </div>

                        {formData.location === 'Online' && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                <h4 className="font-semibold text-sm text-slate-900">Online Meeting Details</h4>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="meetingUrl">Meeting URL</Label>
                                    <Input
                                        id="meetingUrl"
                                        value={formData.meetingUrl}
                                        onChange={(e) => handleInputChange('meetingUrl', e.target.value)}
                                        placeholder="https://zoom.us/j/123456789 or Teams link"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meetingId">Meeting ID (optional)</Label>
                                    <Input
                                        id="meetingId"
                                        value={formData.meetingId}
                                        onChange={(e) => handleInputChange('meetingId', e.target.value)}
                                        placeholder="123 456 7890"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meetingPassword">Meeting Password (optional)</Label>
                                    <Input
                                        id="meetingPassword"
                                        value={formData.meetingPassword}
                                        onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                                        placeholder="Password if required"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Capacity & Access */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Capacity & Access</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="maxParticipants">Max Participants</Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    value={formData.maxParticipants}
                                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                                    placeholder="Leave empty for unlimited"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="targetAudience">Target Audience</Label>
                                <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Members">All Members</SelectItem>
                                        <SelectItem value="Full Members Only">Full Members Only</SelectItem>
                                        <SelectItem value="Associates Only">Associates Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="facilitator">Facilitator/Host</Label>
                            <Input
                                id="facilitator"
                                value={formData.facilitator}
                                onChange={(e) => handleInputChange('facilitator', e.target.value)}
                                placeholder="Name of the person facilitating"
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Media</h3>
                        
                        <div>
                            <Label htmlFor="imageUrl">Banner Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="mt-1.5"
                            />
                            {formData.imageUrl && (
                                <div className="mt-2">
                                    <img src={formData.imageUrl} alt="Preview" className="h-32 w-auto rounded border" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-900">Tags</h3>
                        
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                placeholder="Add a tag..."
                            />
                            <Button type="button" onClick={handleAddTag} variant="outline">
                                Add
                            </Button>
                        </div>

                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, idx) => (
                                    <div key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-purple-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            event ? 'Update Event' : 'Create Event'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}