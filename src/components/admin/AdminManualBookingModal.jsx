import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ifs } from '@/api/ifsClient';
import { Loader2, Search, BookOpen, User, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminManualBookingModal({ open, onOpenChange, preselectedUserId = null, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseVariants, setCourseVariants] = useState([]);
    const [courseDates, setCourseDates] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        userId: preselectedUserId || '',
        courseId: '',
        variantId: '',
        courseDateId: '',
        deductCredits: false,
        creditsToDeduct: 0,
        notes: ''
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        if (open) {
            loadCourses();
            if (preselectedUserId) {
                loadUser(preselectedUserId);
            }
        }
    }, [open, preselectedUserId]);

    useEffect(() => {
        if (formData.courseId) {
            loadCourseVariants(formData.courseId);
            loadCourseDates(formData.courseId, formData.variantId);
        }
    }, [formData.courseId, formData.variantId]);

    const loadUser = async (userId) => {
        try {
            const userList = await ifs.entities.User.filter({ id: userId });
            if (userList.length > 0) {
                setSelectedUser(userList[0]);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    };

    const loadCourses = async () => {
        try {
            const courseList = await ifs.entities.Course.list();
            setCourses(courseList);
        } catch (error) {
            console.error('Failed to load courses:', error);
            toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        }
    };

    const loadCourseVariants = async (courseId) => {
        try {
            const variants = await ifs.entities.CourseVariant.filter({ courseId });
            setCourseVariants(variants);
        } catch (error) {
            console.error('Failed to load course variants:', error);
        }
    };

    const loadCourseDates = async (courseId, variantId = null) => {
        try {
            const filter = variantId ? { courseId, variantId } : { courseId };
            const dates = await ifs.entities.CourseDate.filter(filter);
            setCourseDates(dates);
        } catch (error) {
            console.error('Failed to load course dates:', error);
        }
    };

    const searchUsers = async (query) => {
        if (!query || query.length < 2) {
            setUsers([]);
            return;
        }
        
        setSearchingUsers(true);
        try {
            const results = await ifs.functions.invoke('searchUsers', { query, limit: 10 });
            setUsers(results.data?.users || []);
        } catch (error) {
            console.error('Failed to search users:', error);
            toast({ title: 'Error', description: 'Failed to search users', variant: 'destructive' });
        } finally {
            setSearchingUsers(false);
        }
    };

    const handleUserSearch = (query) => {
        setUserSearchQuery(query);
        searchUsers(query);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({ ...prev, userId: user.id }));
        setUserSearchQuery('');
        setUsers([]);
    };

    const handleCourseSelect = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        setSelectedCourse(course);
        setFormData(prev => ({ 
            ...prev, 
            courseId, 
            variantId: '',
            courseDateId: '',
            creditsToDeduct: course?.cpdHours || 0
        }));
    };

    const handleSubmit = async () => {
        if (!formData.userId || !formData.courseId) {
            toast({ title: 'Missing Information', description: 'Please select both a user and a course', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await ifs.functions.invoke('adminBookCourseForUser', formData);
            
            toast({
                title: 'Success',
                description: data.message || 'Course booked successfully'
            });

            if (onSuccess) onSuccess(data.booking);
            onOpenChange(false);
            
            // Reset form
            setFormData({
                userId: '',
                courseId: '',
                variantId: '',
                courseDateId: '',
                deductCredits: false,
                creditsToDeduct: 0,
                notes: ''
            });
            setSelectedUser(null);
            setSelectedCourse(null);
        } catch (error) {
            console.error('Failed to book course:', error);
            toast({
                title: 'Booking Failed',
                description: error.message || 'Failed to book course for user',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manually Book Course for User</DialogTitle>
                    <DialogDescription>
                        Book a training course for a user and optionally deduct CPD hours from their balance.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* User Selection */}
                    <div>
                        <Label>Select User *</Label>
                        {selectedUser ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 mt-2">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">{selectedUser.displayName || selectedUser.full_name}</p>
                                        <p className="text-sm text-slate-600">{selectedUser.email}</p>
                                        <p className="text-xs text-slate-500">CPD Hours: {selectedUser.cpdHoursBalance || 0}</p>
                                    </div>
                                </div>
                                {!preselectedUserId && (
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                                        Change
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={userSearchQuery}
                                    onChange={(e) => handleUserSearch(e.target.value)}
                                    className="pl-10"
                                />
                                {searchingUsers && (
                                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-slate-400" />
                                )}
                                {users.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {users.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleUserSelect(user)}
                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b last:border-0"
                                            >
                                                <p className="font-medium">{user.displayName || user.full_name}</p>
                                                <p className="text-sm text-slate-600">{user.email}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Course Selection */}
                    <div>
                        <Label>Select Course *</Label>
                        <Select value={formData.courseId} onValueChange={handleCourseSelect}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Choose a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title} {course.cpdHours ? `(${course.cpdHours} CPD hours)` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Course Variant */}
                    {courseVariants.length > 0 && (
                        <div>
                            <Label>Course Variant</Label>
                            <Select value={formData.variantId} onValueChange={(value) => setFormData(prev => ({ ...prev, variantId: value }))}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Choose a variant (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>None</SelectItem>
                                    {courseVariants.map(variant => (
                                        <SelectItem key={variant.id} value={variant.id}>
                                            {variant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Course Date */}
                    {courseDates.length > 0 && (
                        <div>
                            <Label>Course Date</Label>
                            <Select value={formData.courseDateId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseDateId: value }))}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Choose a date (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>None</SelectItem>
                                    {courseDates.map(date => (
                                        <SelectItem key={date.id} value={date.id}>
                                            {date.date} {date.startTime && `- ${date.startTime}`} {date.location && `(${date.location})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* CPD Hours Deduction */}
                    {selectedUser && selectedCourse && (
                        <div className="border rounded-lg p-4 bg-slate-50">
                            <div className="flex items-center space-x-2 mb-3">
                                <Checkbox
                                    id="deductCredits"
                                    checked={formData.deductCredits}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, deductCredits: checked }))}
                                />
                                <Label htmlFor="deductCredits" className="font-medium cursor-pointer">
                                    Deduct CPD Hours from user balance
                                </Label>
                            </div>

                            {formData.deductCredits && (
                                <div>
                                    <Label className="text-sm">CPD Hours to Deduct</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={selectedUser.cpdHoursBalance || 0}
                                        value={formData.creditsToDeduct}
                                        onChange={(e) => setFormData(prev => ({ ...prev, creditsToDeduct: parseInt(e.target.value) || 0 }))}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-slate-600 mt-1">
                                        Available: {selectedUser.cpdHoursBalance || 0} hours
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <Label>Admin Notes (Optional)</Label>
                        <Textarea
                            placeholder="Add any notes about this booking..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="mt-2"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.userId || !formData.courseId}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Booking...
                            </>
                        ) : (
                            <>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Book Course
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}