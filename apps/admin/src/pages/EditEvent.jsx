import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Event } from '@ifs/shared/api/entities';
import { createPageUrl, navigateToUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Loader2, ArrowLeft, PlusCircle, Trash2, Upload, FileText, X } from 'lucide-react';
import { ifs } from '@ifs/shared/api/ifsClient';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { createZoomMeeting } from '@ifs/shared/api/functions';

export default function EditEvent() {
    const { user, loading: userLoading } = useUser();
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        whoIsThisFor: '',
        whatToExpect: '',
        whatYouWillLearn: [''],
        sessionObjectives: [''],
        facilitator: '',
        facilitatorBio: '',
        date: '',
        startTime: '10:00', // Added startTime
        endTime: '13:00',   // Added endTime
        time: '', // This will be a derived field for display
        location: 'Online',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5773898df344?q=80&w=2940&auto=format&fit=crop',
        type: 'Workshop',
        priceStandard: 0,
        priceAssociate: 0,
        priceFullMember: 0,
        tags: [],
        zoomMeetingId: '',
        zoomMeetingPassword: '',
        recordingUrl: '',
        resourcesUrl: '',
        resources: [],
    });
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const eventId = searchParams.get('id');

        if (eventId) {
            const fetchEvent = async () => {
                try {
                    const event = await Event.get(eventId);
                    setEventData({
                        ...event,
                        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '', // Extract YYYY-MM-DD
                        startTime: event.startTime || '10:00', // Assuming event.startTime is stored as HH:MM
                        endTime: event.endTime || '13:00',     // Assuming event.endTime is stored as HH:MM
                        tags: event.tags || [],
                        whatYouWillLearn: event.whatYouWillLearn && event.whatYouWillLearn.length > 0 ? event.whatYouWillLearn : [''],
                        sessionObjectives: event.sessionObjectives && event.sessionObjectives.length > 0 ? event.sessionObjectives : [''],
                        facilitatorBio: event.facilitatorBio || '',
                        resources: event.resources || [],
                    });
                } catch (error) {
                    console.error("Failed to fetch event:", error);
                    toast({ title: "Error", description: "Failed to load event data.", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            };
            fetchEvent();
        } else {
            setLoading(false);
        }
    }, [location.search, toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setEventData(prev => ({ ...prev, [name]: value }));
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

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const newResources = [];
            for (const file of files) {
                const response = await ifs.integrations.Core.UploadFile({
                    file: file,
                });
                if (response.file_url) {
                    newResources.push({
                        name: file.name,
                        url: response.file_url,
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
            console.error("Upload failed:", error);
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const removeResource = (index) => {
        setEventData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const dataToSave = { ...eventData };
        
        // Remove empty strings from arrays
        dataToSave.whatYouWillLearn = dataToSave.whatYouWillLearn.filter(item => item.trim() !== '');
        dataToSave.sessionObjectives = dataToSave.sessionObjectives.filter(item => item.trim() !== '');
        dataToSave.tags = dataToSave.tags.filter(tag => tag.trim() !== '');

        // Construct the full start datetime for the 'date' field in the database
        // and the summary 'time' string.
        if (dataToSave.date && dataToSave.startTime) {
            dataToSave.date = new Date(`${dataToSave.date}T${dataToSave.startTime}`).toISOString();
        }
        // Set the 'time' field as a derived summary string (e.g., "10:00 - 13:00")
        dataToSave.time = `${dataToSave.startTime} - ${dataToSave.endTime}`;
        
        const duration = (() => {
            if (!dataToSave.startTime || !dataToSave.endTime) return 0;
            const [startHours, startMinutes] = dataToSave.startTime.split(':').map(Number);
            const [endHours, endMinutes] = dataToSave.endTime.split(':').map(Number);
            let minutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
            // Handle cases where the event spans into the next day (e.g., 23:00 - 01:00)
            if (minutes < 0) {
                minutes += 24 * 60; // Add 24 hours in minutes
            }
            return minutes;
        })();

        dataToSave.duration = duration; // Add duration to data to be saved

        // Automatic Zoom meeting creation for new online events
        if (!dataToSave.id && dataToSave.location.toLowerCase().includes('online') && dataToSave.date && dataToSave.startTime) {
            try {
                toast({ title: "Creating Zoom Meeting...", description: "Please wait, this may take a moment." });
                // Use the constructed ISO string for Zoom start time
                const startTimeForZoom = dataToSave.date; // dataToSave.date is already an ISO string at this point

                const { data: zoomData } = await createZoomMeeting({
                    topic: dataToSave.title,
                    startTime: startTimeForZoom,
                    duration: duration,
                });

                if (zoomData.success) {
                    dataToSave.zoomMeetingId = zoomData.meetingId;
                    dataToSave.zoomMeetingPassword = zoomData.password;
                    toast({ title: "Zoom Meeting Created!", description: `ID: ${zoomData.meetingId}` });
                } else {
                    throw new Error(zoomData.details || 'Unknown error from Zoom function.');
                }
            } catch (error) {
                console.error("Zoom creation failed:", error);
                toast({ title: "Zoom Creation Failed", description: `The event was saved, but Zoom meeting creation failed. Please add it manually. Error: ${error.message}`, variant: "destructive", duration: 7000 });
            }
        }

        try {
            if (dataToSave.id) {
                await Event.update(dataToSave.id, dataToSave);
                toast({ title: "Event Updated", description: "Your changes have been saved." });
            } else {
                await Event.create(dataToSave);
                toast({ title: "Event Created", description: "The new event has been added." });
            }
            navigateToUrl(navigate, createPageUrl('AdminDashboard'));
        } catch (error) {
            console.error("Failed to save event:", error);
            toast({ title: "Save Failed", description: "An error occurred while saving the event.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (userLoading || loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!user || user.role !== 'admin') {
        return <div className="text-center p-8">Access Denied.</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link to={createPageUrl('AdminDashboard')} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Admin Dashboard
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-6">{eventData.id ? 'Edit Event' : 'Create New Event'}</h1>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Core Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input name="title" placeholder="Event Title" value={eventData.title} onChange={handleChange} />
                                    <Textarea name="description" placeholder="Event Description" value={eventData.description} onChange={handleChange} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Content & Audience</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea name="whoIsThisFor" placeholder="Who is this event for?" value={eventData.whoIsThisFor} onChange={handleChange} />
                                    <Textarea name="whatToExpect" placeholder="What can attendees expect?" value={eventData.whatToExpect} onChange={handleChange} />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>Learning Points</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">What You Will Learn</label>
                                        {eventData.whatYouWillLearn.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 mt-2">
                                                <Input value={item} onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)} placeholder={`Learning point #${index + 1}`} />
                                                <Button variant="ghost" size="icon" onClick={() => removeArrayItem('whatYouWillLearn', index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem('whatYouWillLearn')} className="mt-2"><PlusCircle className="w-4 h-4 mr-2" />Add Point</Button>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Session Objectives</label>
                                        {eventData.sessionObjectives.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 mt-2">
                                                <Input value={item} onChange={(e) => handleArrayChange('sessionObjectives', index, e.target.value)} placeholder={`Objective #${index + 1}`} />
                                                <Button variant="ghost" size="icon" onClick={() => removeArrayItem('sessionObjectives', index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addArrayItem('sessionObjectives')} className="mt-2"><PlusCircle className="w-4 h-4 mr-2" />Add Objective</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>Facilitator</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Input name="facilitator" placeholder="Facilitator Name" value={eventData.facilitator} onChange={handleChange} />
                                    <Textarea name="facilitatorBio" placeholder="Facilitator Biography" value={eventData.facilitatorBio} onChange={handleChange} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Schedule & Location</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input name="date" type="date" value={eventData.date} onChange={handleChange} />
                                    <Input name="startTime" type="time" value={eventData.startTime} onChange={handleChange} />
                                    <Input name="endTime" type="time" value={eventData.endTime} onChange={handleChange} />
                                    <Input name="location" placeholder="Location (e.g., Online)" value={eventData.location} onChange={handleChange} className="md:col-span-3" />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select name="type" value={eventData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                                        <SelectTrigger><SelectValue placeholder="Event Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Workshop">Workshop</SelectItem>
                                            <SelectItem value="Webinar">Webinar</SelectItem>
                                            <SelectItem value="Conference">Conference</SelectItem>
                                            <SelectItem value="Networking">Networking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input name="tags" placeholder="Tags (comma-separated)" value={eventData.tags.join(', ')} onChange={(e) => setEventData(prev => ({...prev, tags: e.target.value.split(',').map(t => t.trim())}))} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing (GBP)</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input name="priceStandard" type="number" placeholder="Standard Price" value={eventData.priceStandard} onChange={handleChange} />
                                    <Input name="priceAssociate" type="number" placeholder="Associate Member Price" value={eventData.priceAssociate} onChange={handleChange} />
                                    <Input name="priceFullMember" type="number" placeholder="Full Member Price" value={eventData.priceFullMember} onChange={handleChange} />
                                </CardContent>
                            </Card>
                            
                             <Card>
                                <CardHeader><CardTitle>Links & Media</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Input name="imageUrl" placeholder="Image URL" value={eventData.imageUrl} onChange={handleChange} />
                                    <Input name="recordingUrl" placeholder="Post-Event Recording URL" value={eventData.recordingUrl} onChange={handleChange} />
                                    <Input name="resourcesUrl" placeholder="Legacy Resources URL (optional)" value={eventData.resourcesUrl} onChange={handleChange} />
                                    
                                    <div className="space-y-3 pt-4 border-t">
                                        <label className="text-sm font-medium text-slate-700">Attached Resources (Files)</label>
                                        <div className="space-y-2">
                                            {eventData.resources && eventData.resources.map((resource, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                        <a href={resource.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                                                            {resource.name}
                                                        </a>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => removeResource(index)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild disabled={isUploading}>
                                                <label className="cursor-pointer">
                                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                                    {isUploading ? 'Uploading...' : 'Upload Resources'}
                                                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                                                </label>
                                            </Button>
                                            <span className="text-xs text-slate-500">PDF, PNG, etc.</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Zoom Details (Read-only)</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input name="zoomMeetingId" placeholder="Zoom Meeting ID" value={eventData.zoomMeetingId} readOnly />
                                    <Input name="zoomMeetingPassword" placeholder="Zoom Meeting Password" value={eventData.zoomMeetingPassword} readOnly />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isSaving ? 'Saving...' : 'Save Event'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
