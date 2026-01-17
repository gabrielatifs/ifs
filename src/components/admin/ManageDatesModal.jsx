
import React, { useState, useEffect } from 'react';
import { CourseDate } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { formatDateRange } from '../utils/formatters';


const ManageDatesModal = ({ course, isOpen, onClose, onDatesUpdate }) => {
    const { toast } = useToast();
    const [dates, setDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Changed from 'loading' to 'isLoading'
    const [isSaving, setIsSaving] = useState(false);
    const [newDate, setNewDate] = useState({
        date: '',
        endDate: '',
        startTime: '09:30',
        endTime: '16:30',
        location: 'Online',
        status: 'Available',
        datePatternDescription: '' // Added new field
    });

    const fetchDates = async () => {
        if (!course) return;
        setIsLoading(true); // Changed from setLoading to setIsLoading
        try {
            const courseDates = await CourseDate.filter({ courseId: course.id }, '-date');
            setDates(courseDates);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load course dates.", variant: "destructive" });
        } finally {
            setIsLoading(false); // Changed from setLoading to setIsLoading
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchDates();
        }
    }, [isOpen, course]);

    // handleNewDateChange is no longer needed as direct state updates are used in JSX per outline
    // const handleNewDateChange = (field, value) => {
    //     setNewDate(prev => ({ ...prev, [field]: value }));
    // };

    const handleAddDate = async () => {
        if (!newDate.date) {
            toast({ title: "Validation Error", description: "Please select a start date.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            await CourseDate.create({
                ...newDate,
                courseId: course.id,
                endDate: newDate.endDate || null, // Ensure empty string becomes null
                datePatternDescription: newDate.datePatternDescription || null, // Added new field
            });
            toast({ title: "Success", description: "New date added successfully." });
            setNewDate({ date: '', endDate: '', startTime: '09:30', endTime: '16:30', location: 'Online', status: 'Available', datePatternDescription: '' }); // Reset new field
            await fetchDates(); // Refetch
        } catch (error) {
            console.error('Failed to add date:', error);
            toast({ title: "Error", description: "Failed to add new date.", variant: "destructive" }); // Updated description
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDate = async (dateId) => {
        try {
            await CourseDate.delete(dateId);
            toast({ title: "Success", description: "Date deleted successfully." });
            setDates(prev => prev.filter(d => d.id !== dateId));
        } catch (error) {
            toast({ title: "Error", description: `Failed to delete date: ${error.message}`, variant: "destructive" });
        }
    };

    const handleModalClose = () => {
        onDatesUpdate(); // Trigger refetch on the parent
        onClose();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Available':
                return <Badge variant="success">Available</Badge>;
            case 'Full':
                return <Badge variant="destructive">Full</Badge>;
            case 'Cancelled':
                return <Badge variant="outline">Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl"> {/* Updated max-width */}
                <DialogHeader>
                    <DialogTitle>Manage Dates for: {course?.title}</DialogTitle> {/* Changed title format */}
                    <DialogDescription>Add, view, or remove scheduled dates for this course.</DialogDescription> {/* Added description */}
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"> {/* New grid layout */}
                    {/* Add new date form */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Add New Date</h3> {/* Updated styling */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input id="start-date" type="date" value={newDate.date} onChange={(e) => setNewDate({ ...newDate, date: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="end-date">End Date (Optional)</Label>
                                <Input id="end-date" type="date" value={newDate.endDate} onChange={(e) => setNewDate({ ...newDate, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="date-pattern">Date Pattern (if non-consecutive)</Label>
                            <Input
                                id="date-pattern"
                                type="text"
                                placeholder="e.g., 'Mondays & Wednesdays for 3 weeks'"
                                value={newDate.datePatternDescription}
                                onChange={(e) => setNewDate({ ...newDate, datePatternDescription: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 mt-1">This text will override the date range display.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start-time">Start Time</Label>
                                <Input id="start-time" type="time" value={newDate.startTime} onChange={(e) => setNewDate({ ...newDate, startTime: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="end-time">End Time</Label>
                                <Input id="end-time" type="time" value={newDate.endTime} onChange={(e) => setNewDate({ ...newDate, endTime: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5"> {/* Kept original space-y for consistency with prior fields */}
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" type="text" value={newDate.location} onChange={(e) => setNewDate({ ...newDate, location: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="status">Status</Label>
                            <Select value={newDate.status} onValueChange={(value) => setNewDate({ ...newDate, status: value })}>
                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Full">Full</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddDate} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Plus className="w-4 h-4 mr-2" />}
                            Add Date
                        </Button>
                    </div>

                    {/* Existing dates list */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Scheduled Dates</h3> {/* Updated styling */}
                        {isLoading ? ( // Changed 'loading' to 'isLoading'
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                        ) : dates.length > 0 ? (
                            <div className="max-h-96 overflow-y-auto pr-2 space-y-2"> {/* Adjusted max-height and overflow */}
                                {dates.map(date => (
                                    <div key={date.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            {/* Display datePatternDescription if available, otherwise format date range */}
                                            <p className="font-semibold text-slate-800">{date.datePatternDescription || formatDateRange(date.date, date.endDate)}</p>
                                            <p className="text-sm text-slate-500">{date.startTime} - {date.endTime} @ {date.location}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(date.status)}
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDate(date.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Simplified "No dates scheduled" message
                            <p className="text-slate-500 text-sm">No dates scheduled yet.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleModalClose}>Close</Button> {/* Kept handleModalClose */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ManageDatesModal;
