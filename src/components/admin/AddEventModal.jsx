import React, { useState, useRef, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X, PlusCircle, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { UploadFile } from '@/api/integrations';
import { ifs } from '@/api/ifsClient';

const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
};

const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
};

const DEFAULT_START_TIME = '10:00';
const DEFAULT_END_TIME = '13:00';

const NEW_EVENT_TEMPLATE = {
    title: '',
    description: '',
    whoIsThisFor: '',
    whatToExpected: '',
    whatYouWillLearn: [''],
    sessionObjectives: [''],
    facilitator: '',
    facilitatorBio: '',
    type: 'Masterclass',
    location: 'Online',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    time: formatTimeRange(DEFAULT_START_TIME, DEFAULT_END_TIME),
    duration: calculateDuration(DEFAULT_START_TIME, DEFAULT_END_TIME),
    imageUrl: '',
    priceStandard: 0,
    priceAssociate: 0,
    priceFullMember: 0,
    meetingUrl: '',
    meetingPassword: '',
    meetingId: '',
    resources: [],
};

export default function AddEventModal({ isOpen, onClose, onEventSaved, eventToEdit }) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [eventData, setEventData] = useState(NEW_EVENT_TEMPLATE);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                setEventData(prev => ({
                    ...NEW_EVENT_TEMPLATE,
                    ...eventToEdit,
                    date: eventToEdit.date ? format(new Date(eventToEdit.date), 'yyyy-MM-dd') : NEW_EVENT_TEMPLATE.date,
                    whatYouWillLearn: eventToEdit.whatYouWillLearn?.length > 0 ? eventToEdit.whatYouWillLearn : [''],
                    sessionObjectives: eventToEdit.sessionObjectives?.length > 0 ? eventToEdit.sessionObjectives : [''],
                    time: formatTimeRange(eventToEdit.startTime, eventToEdit.endTime),
                    duration: calculateDuration(eventToEdit.startTime, eventToEdit.endTime),
                    resources: eventToEdit.resources || [],
                }));
            } else {
                setEventData(NEW_EVENT_TEMPLATE);
            }
        }
    }, [isOpen, eventToEdit]);

    // Init Google Maps Autocomplete for physical location
    useEffect(() => {
        if (isOpen && eventData.location !== 'Online') {
            // Small delay to ensure input is rendered
            const timer = setTimeout(() => {
                const input = document.getElementById('event-location-input');
                if (input && window.google && window.google.maps) {
                    const autocomplete = new window.google.maps.places.Autocomplete(input, {
                        fields: ['formatted_address', 'name', 'geometry'],
                    });
                    
                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.formatted_address || place.name) {
                            setEventData(prev => ({
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
    }, [isOpen, eventData.location]);

    const handleInputChange = (field, value) => {
        setEventData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === 'startTime' || field === 'endTime') {
                const currentStartTime = field === 'startTime' ? value : prev.startTime;
                const currentEndTime = field === 'endTime' ? value : prev.endTime;

                updated.time = formatTimeRange(currentStartTime, currentEndTime);
                updated.duration = calculateDuration(currentStartTime, currentEndTime);
            }

            return updated;
        });
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...eventData[field]];
        newArray[index] = value;
        setEventData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field) => {
        setEventData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (field, index) => {
        const newArray = eventData[field].filter((_, i) => i !== index);
        setEventData(prev => ({ ...prev, [field]: newArray }));
    };

    const resetForm = () => {
        setEventData(NEW_EVENT_TEMPLATE);
    };

    const handleClose = () => {
        if (!isSaving && !isUploading) {
            resetForm();
            onClose();
        }
    };

    const handleResourceUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const newResources = [];
            for (const file of files) {
                const { file_url } = await UploadFile({ file });
                if (file_url) {
                    newResources.push({
                        name: file.name,
                        url: file_url,
                        type: file.type
                    });
                }
            }
            setEventData(prev => ({
                ...prev,
                resources: [...(prev.resources || []), ...newResources]
            }));
            toast({ title: "Upload Successful", description: `${newResources.length} file(s) uploaded.` });
        } catch (error) {
            console.error("Resource upload failed:", error);
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
            // Reset file input if needed, though we don't have a ref for this one yet
        }
    };

    const removeResource = (index) => {
        setEventData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File Type",
                description: "Please select an image file (PNG, JPG, etc.)",
                variant: "destructive",
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please select an image smaller than 5MB",
                variant: "destructive",
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setEventData(prev => ({ ...prev, imageUrl: file_url }));
            toast({
                title: "Image Uploaded",
                description: "Event image has been updated successfully.",
            });
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                title: "Upload Failed",
                description: `Failed to upload image. Please try again. ${error.message || ''}`,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.endTime) {
            toast({
                title: "Missing Required Fields",
                description: "Please fill in the Event Title, Date, Start Time, and End Time.",
                variant: "destructive",
            });
            return;
        }

        if (eventData.endTime <= eventData.startTime) {
            toast({
                title: "Invalid Time Range",
                description: "End time must be after start time.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = { ...eventData };

            dataToSave.whatYouWillLearn = dataToSave.whatYouWillLearn.filter(item => item.trim() !== '');
            dataToSave.sessionObjectives = dataToSave.sessionObjectives.filter(item => item.trim() !== '');

            if (!dataToSave.imageUrl) {
                dataToSave.imageUrl = 'https://images.unsplash.com/photo-1556761175-5773898df344?q=80&w=2940&auto=format&fit=crop';
            }

            let savedEvent;
            if (eventToEdit?.id) {
                const { id, ...updateData } = dataToSave;
                savedEvent = await ifs.entities.Event.update(eventToEdit.id, updateData);
                toast({
                    title: "Event Updated!",
                    description: `"${dataToSave.title}" has been updated successfully.`,
                });
            } else {
                savedEvent = await ifs.entities.Event.create(dataToSave);
                toast({
                    title: "Event Created!",
                    description: `"${dataToSave.title}" has been created successfully.`,
                });
            }
            resetForm();
            onClose();
            if (onEventSaved) {
                onEventSaved(savedEvent);
            }
        } catch (error) {
            console.error("Failed to save event:", error);
            toast({
                title: "Save Failed",
                description: `There was an error saving the event. ${error.message || ''}`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const isEditing = !!eventToEdit?.id;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    value={eventData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={eventData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whoIsThisFor">Who is this for?</Label>
                                <Textarea
                                    id="whoIsThisFor"
                                    rows={3}
                                    value={eventData.whoIsThisFor}
                                    onChange={(e) => handleInputChange('whoIsThisFor', e.target.value)}
                                    placeholder="Describe the target audience..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatToExpected">What to Expect</Label>
                                <Textarea
                                    id="whatToExpected"
                                    rows={3}
                                    value={eventData.whatToExpected}
                                    onChange={(e) => handleInputChange('whatToExpected', e.target.value)}
                                    placeholder="Describe the format and what attendees can expect..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Learning Objectives</Label>
                                {eventData.whatYouWillLearn.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                                            placeholder="What will participants learn?"
                                        />
                                        {eventData.whatYouWillLearn.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeArrayItem('whatYouWillLearn', index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem('whatYouWillLearn')}
                                    className="mt-2"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Learning Objective
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Session Objectives</Label>
                                {eventData.sessionObjectives.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayChange('sessionObjectives', index, e.target.value)}
                                            placeholder="Session objective..."
                                        />
                                        {eventData.sessionObjectives.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeArrayItem('sessionObjectives', index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem('sessionObjectives')}
                                    className="mt-2"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Session Objective
                                </Button>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={eventData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Start Time *</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={eventData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endTime">End Time *</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={eventData.endTime}
                                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {eventData.time && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">
                                        <strong>Time:</strong> {eventData.time}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        <strong>Duration:</strong> {eventData.duration} minutes
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="facilitator">Facilitator</Label>
                                <Input
                                    id="facilitator"
                                    value={eventData.facilitator}
                                    onChange={(e) => handleInputChange('facilitator', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="facilitatorBio">Facilitator Bio</Label>
                                <Textarea
                                    id="facilitatorBio"
                                    rows={3}
                                    value={eventData.facilitatorBio}
                                    onChange={(e) => handleInputChange('facilitatorBio', e.target.value)}
                                    placeholder="Brief biography of the facilitator..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type</Label>
                                <Select value={eventData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Masterclass">Masterclass</SelectItem>
                                        <SelectItem value="Webinar">Webinar</SelectItem>
                                        <SelectItem value="Conference">Conference</SelectItem>
                                        <SelectItem value="Networking">Networking</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                {/* Toggle between Online and Physical Location Search */}
                                <div className="flex gap-2 mb-2">
                                    <Button 
                                        type="button"
                                        variant={eventData.location === 'Online' ? 'default' : 'outline'} 
                                        size="sm" 
                                        onClick={() => handleInputChange('location', 'Online')}
                                    >
                                        Online
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant={eventData.location !== 'Online' ? 'default' : 'outline'} 
                                        size="sm" 
                                        onClick={() => {
                                            if (eventData.location === 'Online') handleInputChange('location', '');
                                        }}
                                    >
                                        Physical Location
                                    </Button>
                                </div>

                                {eventData.location !== 'Online' && (
                                    <div>
                                        <Input 
                                            id="event-location-input"
                                            value={eventData.location === 'Online' ? '' : eventData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder="Search for a location..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Meeting Details Section */}
                            {eventData.location === 'Online' && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-sm text-slate-900">Online Meeting Details</h4>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="meetingUrl">Meeting URL</Label>
                                        <Input
                                            id="meetingUrl"
                                            value={eventData.meetingUrl}
                                            onChange={(e) => handleInputChange('meetingUrl', e.target.value)}
                                            placeholder="https://zoom.us/j/123456789 or Teams link"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meetingId">Meeting ID (optional)</Label>
                                        <Input
                                            id="meetingId"
                                            value={eventData.meetingId}
                                            onChange={(e) => handleInputChange('meetingId', e.target.value)}
                                            placeholder="123 456 7890"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="meetingPassword">Meeting Password (optional)</Label>
                                        <Input
                                            id="meetingPassword"
                                            value={eventData.meetingPassword}
                                            onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                                            placeholder="Password if required"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Image</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="shrink-0"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            Upload Image
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                    <Input
                                        placeholder="Or paste image URL..."
                                        value={eventData.imageUrl}
                                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Upload an image file (max 5MB) or paste a URL
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Event Resources</Label>
                                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="space-y-2">
                                        {eventData.resources && eventData.resources.map((resource, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border shadow-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    <a href={resource.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                                                        {resource.name}
                                                    </a>
                                                </div>
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => removeResource(index)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(!eventData.resources || eventData.resources.length === 0) && (
                                            <p className="text-xs text-slate-500 text-center py-2">No resources attached</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" asChild disabled={isUploading} className="w-full">
                                            <label className="cursor-pointer flex items-center justify-center">
                                                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                                {isUploading ? 'Uploading...' : 'Upload Documents'}
                                                <input type="file" multiple className="hidden" onChange={handleResourceUpload} />
                                            </label>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center">
                                        Supported files: PDF, Word, Excel, Images, etc.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Pricing (£)</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs">Standard</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={eventData.priceStandard}
                                            onChange={(e) => handleInputChange('priceStandard', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Associate</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={eventData.priceAssociate}
                                            onChange={(e) => handleInputChange('priceAssociate', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Full Member</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={eventData.priceFullMember}
                                            onChange={(e) => handleInputChange('priceFullMember', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving || isUploading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || isUploading}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isEditing ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}