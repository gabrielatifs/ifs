import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Course } from '@/api/entities';
import { CourseVariant } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, BookOpen, Clock, Award, CheckCircle, Target, ListChecks, CheckCircle2 as CheckCircleIcon, ArrowRight, GraduationCap, Users, ChevronDown, ChevronUp, MapPin, ExternalLink, Info, Calendar, Globe, Download } from 'lucide-react';
import { TrainingEnquiry } from '@/api/entities';
import { sendEmail } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { customLoginWithRedirect } from '../components/utils/auth';
import MainSiteNav from '../components/marketing/MainSiteNav';
import MarketingFooter from '../components/marketing/MarketingFooter';
import { User } from '@/api/entities';
import { usePostHog } from '../components/providers/PostHogProvider';
import { CourseDate } from '@/api/entities';
import { format as formatDate } from 'date-fns';
import { formatDateRange } from '../components/utils/formatters';
import { base44 } from '@/api/base44Client';
import { createDynamicCourseCheckout } from '@/api/functions';
import { CourseBooking } from '@/api/entities';
import { wrapEmailHtml } from '../../packages/shared/src/emails/wrapper.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrgBulkBookingModal from '../components/portal/OrgBulkBookingModal';

// Mappings to convert long database categories to UI-friendly names
const categoryMapping = {
    'Introduction to Safeguarding': 'introductory',
    'Advanced Courses for Individuals with Safeguarding Responsibilities': 'advanced',
    'Advanced Courses for Designated Safeguarding Leads': 'advanced',
    'Annual Refresher Courses for DSLs and DSOs': 'refresher'
};

const uiCategories = [
    { id: 'introductory', name: 'Introductory' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'refresher', name: 'Refresher' }
];

// Refactored getEmailWrapper function as per outline
const getEmailWrapper = (content) => wrapEmailHtml(content);

export default function TrainingCourseDetails() {
    const [course, setCourse] = useState(null);
    const [variants, setVariants] = useState([]);
    const [courseDates, setCourseDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const { trackEvent } = usePostHog();

    // Enquiry state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enquirySubmitted, setEnquirySubmitted] = useState(false);
    const [enquiryData, setEnquiryData] = useState({ name: '', email: '', phoneNumber: '', organisation: '', message: '', geography: '', numberOfParticipants: 1 });
    const [selectedDateId, setSelectedDateId] = useState(null);
    const [bookedDateIds, setBookedDateIds] = useState([]);
    
    // Tab state
    const [activeTab, setActiveTab] = useState('booking');
    
    // Booking dialog state
    const [showBookingDialog, setShowBookingDialog] = useState(false);
    const [selectedDateForBooking, setSelectedDateForBooking] = useState(null);
    const [numberOfParticipants, setNumberOfParticipants] = useState(1);
    const [cpdHoursToUse, setCpdHoursToUse] = useState(0);
    const [bookingNotes, setBookingNotes] = useState('');
    const [showEnquiryForm, setShowEnquiryForm] = useState(false);
    const [showGuestReserveDialog, setShowGuestReserveDialog] = useState(false);
    const [guestReserveData, setGuestReserveData] = useState({ name: '', email: '', organisation: '', phoneNumber: '' });
    const [showOrgBulkBookingModal, setShowOrgBulkBookingModal] = useState(false);
    const [bulkBookingDate, setBulkBookingDate] = useState(null);
    
    // Quote calculator state
    const [quoteParticipants, setQuoteParticipants] = useState(1);

    // Expandable sections state
    const [expandedSections, setExpandedSections] = useState({
        objectives: false,
        benefits: false,
        faq: false
    });

    // Modified to return an array of formats
    const getFormatsArray = useMemo(() => {
        if (!course) return [];
        
        if (variants && variants.length > 0) {
            const allFormats = [...new Set(variants.flatMap(v => v.format || []))];
            return [...new Set(allFormats.map(f => f === 'Online Live' ? 'Online' : f))];
        }
        
        const rawFormats = Array.isArray(course.format) ? course.format : (course.format ? [course.format] : []);
        return [...new Set(rawFormats.map(f => f === 'Online Live' ? 'Online' : f))];
    }, [course, variants]);

    const getDuration = useMemo(() => {
        if (!course) return '';
        
        // Get duration from variants if they exist
        if (variants && variants.length > 0) {
            const durations = [...new Set(variants.map(v => v.duration).filter(d => d))];
            if (durations.length === 1) return durations[0];
            if (durations.length > 1) return 'Varies';
        }
        
        // Fallback to course duration
        return course.duration || '';
    }, [course, variants]);

    const getTargetAudience = useMemo(() => {
        if (!course) return '';
        
        // Try to get target audience from course data or derive from title/tags
        if (course.targetAudience) return course.targetAudience;
        
        // Derive from course level and tags
        if (course.level === 'Foundation') return 'New to safeguarding';
        if (course.level === 'Advanced') return 'Experienced practitioners';
        if (course.level === 'Refresher') return 'Current safeguarding professionals';
        if (course.level === 'Short & Specialist') return 'Specialist focus';
        
        return 'All levels welcome';
    }, [course]);

    // Modified to return an array of geographies
    const getGeographiesArray = useMemo(() => {
        if (!course) return [];
        
        // Standard geography ordering function
        const sortGeographies = (geographies) => {
            const order = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'UK-Wide', 'International'];
            return [...geographies].sort((a, b) => {
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);

                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                
                return indexA - indexB;
            });
        };

        if (variants && variants.length > 0) {
            const allGeographies = [...new Set(variants.flatMap(v => v.supportedGeographies || []))];
            return sortGeographies(allGeographies);
        }
        
        // Fallback to course geography
        const courseGeographies = Array.isArray(course.geography) ? course.geography : (course.geography ? [course.geography] : []);
        return sortGeographies(courseGeographies);
    }, [course, variants]);

    // New memo to aggregate data for the overview card
    const displayData = useMemo(() => {
        return {
            duration: getDuration,
            format: getFormatsArray,
            geography: getGeographiesArray,
            targetAudience: getTargetAudience,
        };
    }, [getDuration, getFormatsArray, getGeographiesArray, getTargetAudience]);


    // Existing memo to get available geographies for the dropdown
    const getAvailableGeographies = useMemo(() => {
        if (!course) return [];
        
        // Get all unique geographies from variants or course
        if (variants && variants.length > 0) {
            const allGeographies = [...new Set(variants.flatMap(v => v.supportedGeographies || []))];
            return allGeographies.sort((a, b) => {
                const order = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'UK-Wide', 'International'];
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }
        
        // Fallback to course geography
        const courseGeographies = Array.isArray(course.geography) ? course.geography : (course.geography ? [course.geography] : []);
        return courseGeographies.sort((a, b) => {
            const order = ['England', 'Wales', 'Scotland', 'Northern Ireland', 'UK-Wide', 'International'];
            const indexA = order.indexOf(a);
            const indexB = order.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [course, variants]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            if (user && course) {
                try {
                    const bookings = await CourseBooking.filter({
                        userId: user.id,
                        courseId: course.id,
                        status: 'confirmed'
                    });
                    setBookedDateIds(bookings.map(b => b.courseDateId).filter(Boolean));
                } catch (e) {
                    console.error("Error fetching bookings", e);
                }
            }
        };
        fetchBookings();
    }, [user, course]);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            const searchParams = new URLSearchParams(location.search);
            const courseId = searchParams.get('id');
            const courseTitle = searchParams.get('title');

            try {
                let fetchedCourse = null;
                let fetchedVariants = [];
                
                if (courseId) {
                    fetchedCourse = await Course.get(courseId);
                    // Fetch variants and dates for this course
                    const [allVariants, allDates] = await Promise.all([
                        CourseVariant.list(),
                        CourseDate.list()
                    ]);
                    fetchedVariants = allVariants.filter(v => v.courseId === courseId);
                    
                    const upcomingDates = allDates
                        .filter(d => d.courseId === courseId && new Date(d.date) >= new Date())
                        .sort((a, b) => new Date(a.date) - new Date(b.date));
                    setCourseDates(upcomingDates);

                } else if (courseTitle) {
                    // Decode the URL-encoded title
                    const decodedTitle = decodeURIComponent(courseTitle);
                    console.log("Looking for course with title:", decodedTitle);
                    
                    // Get all courses and find by partial title match for more flexibility
                    const allCourses = await Course.list();
                    fetchedCourse = allCourses.find(course => 
                        course.title && course.title.toLowerCase().includes(decodedTitle.toLowerCase())
                    );
                    
                    // If no partial match, try exact match
                    if (!fetchedCourse) {
                        fetchedCourse = allCourses.find(course => 
                            course.title === decodedTitle
                        );
                    }
                    
                    // If we found a course, get its variants and dates
                    if (fetchedCourse) {
                        const [allVariants, allDates] = await Promise.all([
                            CourseVariant.list(),
                            CourseDate.list()
                        ]);
                        fetchedVariants = allVariants.filter(v => v.courseId === fetchedCourse.id);
                        const upcomingDates = allDates
                            .filter(d => d.courseId === fetchedCourse.id && new Date(d.date) >= new Date())
                            .sort((a, b) => new Date(a.date) - new Date(b.date));
                        setCourseDates(upcomingDates);
                    }
                }
                
                console.log("Found course:", fetchedCourse);
                console.log("Found variants:", fetchedVariants);
                setCourse(fetchedCourse);
                setVariants(fetchedVariants);
                if (fetchedCourse) {
                    document.title = `Training Course: ${fetchedCourse.title} - IfS`;
                }
            } catch (error) {
                console.error("Error fetching course details:", error);
                setCourse(null);
                setVariants([]);
                setCourseDates([]); // Ensure dates are cleared on error
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [location.search]);

    // New useEffect to pre-select the course date if there is only one option
    useEffect(() => {
        if (courseDates && courseDates.length === 1) {
            setSelectedDateId(courseDates[0].id);
        }
    }, [courseDates]);

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        if (!course) return;
        setIsSubmitting(true);

        try {
            // Renamed from `selectedDate` to `selectedCourseDate` for clarity as per outline context
            const selectedCourseDate = selectedDateId ? courseDates.find(d => d.id === selectedDateId) : null;
            
            const submissionData = {
                ...enquiryData,
                courseTitle: course.title,
                courseId: course.id,
                status: 'new',
                selectedDate: selectedCourseDate?.date || null, // Ensure selectedCourseDate.date is null if no date selected
                selectedTime: selectedCourseDate ? `${selectedCourseDate.startTime} - ${selectedCourseDate.endTime}` : null,
                selectedLocation: selectedCourseDate?.location || null, // Ensure selectedCourseDate.location is null if no date selected
            };

            await TrainingEnquiry.create(submissionData);
            
            // Send confirmation email to admin (updated content and structure as per outline)
            const emailToAdminBody = `
                <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                    <h1 style="color: #333; font-size: 24px;">New Training Enquiry</h1>
                    <p>You have received a new enquiry for the course: <strong>${course.title}</strong>.</p>
                    <div style="background-color: #fafafa; border-left: 4px solid #5e028f; padding: 20px; margin: 20px 0;">
                        <h2 style="color: #5e028f; margin: 0 0 10px 0;">Enquiry Details</h2>
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${enquiryData.name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${enquiryData.email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${enquiryData.phoneNumber}</p>
                        ${enquiryData.organisation ? `<p style="margin: 5px 0;"><strong>Organisation:</strong> ${enquiryData.organisation}</p>` : ''}
                        ${selectedCourseDate ? `
                            <p style="margin: 5px 0;"><strong>Selected Date:</strong> ${formatDateRange(selectedCourseDate.date, selectedCourseDate.endDate)}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${selectedCourseDate.startTime} - ${selectedCourseDate.endTime}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> ${selectedCourseDate.location}</p>
                        ` : (enquiryData.geography ? `<p style="margin: 5px 0;"><strong>Preferred Location:</strong> ${enquiryData.geography}</p>` : '<p style="margin: 5px 0;"><strong>Date:</strong> No specific date selected.</p>')}
                        ${enquiryData.message ? `<p style="margin: 15px 0 0 0;"><strong>Message:</strong><br/>${enquiryData.message.replace(/\n/g, '<br/>')}</p>` : ''}
                    </div>
                </td>
            `;

            // Send confirmation email to user (updated content and structure as per outline)
            const userEmailBody = `
                <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                    <h1 style="color: #333; font-size: 24px;">Thank you for your enquiry</h1>
                    <p>Hi ${enquiryData.name},</p>
                    <p>We've received your enquiry for <strong>${course.title}</strong> and will be in touch shortly. Here's a summary of your request:</p>
                    <div style="background-color: #fafafa; border-left: 4px solid #5e028f; padding: 20px; margin: 20px 0;">
                         ${selectedCourseDate ? `
                            <p style="margin: 5px 0;"><strong>Selected Date:</strong> ${formatDateRange(selectedCourseDate.date, selectedCourseDate.endDate)}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${selectedCourseDate.startTime} - ${selectedCourseDate.endTime}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> ${selectedCourseDate.location}</p>
                        ` : (enquiryData.geography ? `<p style="margin: 5px 0;"><strong>Preferred Location:</strong> ${enquiryData.geography}</p>` : '<p style="margin: 5px 0;"><strong>Date:</strong> You requested more information without selecting a specific date.</p>')}
                        ${enquiryData.message ? `<p style="margin: 15px 0 0 0;"><strong>Your Message:</strong><br/>${enquiryData.message.replace(/\n/g, '<br/>')}</p>` : ''}
                    </div>
                    <p>If you have any immediate questions, feel free to reply to this email.</p>
                </td>
            `;

            await Promise.all([
                sendEmail({ to: 'info@ifs-safeguarding.co.uk', subject: `Training Enquiry: ${course.title}`, html: getEmailWrapper(emailToAdminBody) }),
                sendEmail({ to: enquiryData.email, subject: `Your IfS Training Enquiry: ${course.title}`, html: getEmailWrapper(userEmailBody) })
            ]);

            setEnquirySubmitted(true);
        } catch (error) {
            console.error("Failed to submit enquiry:", error);
            toast({ title: "Submission Failed", description: "There was an error sending your enquiry. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleJoin = () => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: 'course_details_mobile',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        customLoginWithRedirect(url);
    };

    const handleBookNowClick = (date) => {
        if (!user) {
            setSelectedDateForBooking(date);
            setGuestReserveData({ name: '', email: '', organisation: '', phoneNumber: '' });
            setShowGuestReserveDialog(true);
            return;
        }
        
        setSelectedDateForBooking(date);
        setNumberOfParticipants(quoteParticipants);
        const courseCpdHours = course.cpdHours || 0;
        const basePrice = courseCpdHours * 20 * quoteParticipants;
        const userCpdHours = user?.cpdHours || 0;
        const maxHoursUsable = Math.floor(basePrice / 20 * 10) / 10;
        const defaultHours = Math.min(userCpdHours, maxHoursUsable);
        setCpdHoursToUse(parseFloat(defaultHours.toFixed(1)));
        setBookingNotes('');
        setShowBookingDialog(true);
    };

    const handleOrgBulkBookClick = (date) => {
        setBulkBookingDate(date);
        setShowOrgBulkBookingModal(true);
    };

    const handleGuestReservationSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const reservationPayload = {
                courseTitle: course.title,
                courseId: course.id,
                name: guestReserveData.name,
                email: guestReserveData.email,
                phoneNumber: guestReserveData.phoneNumber,
                organisation: guestReserveData.organisation,
                message: `Reservation request for ${formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate)} at ${selectedDateForBooking.location}`,
                status: 'new',
                selectedDate: selectedDateForBooking.date,
                selectedTime: `${selectedDateForBooking.startTime} - ${selectedDateForBooking.endTime}`,
                selectedLocation: selectedDateForBooking.location
            };

            await TrainingEnquiry.create(reservationPayload);
            await sendGuestReservationEmails(reservationPayload, selectedDateForBooking);

            toast({
                title: "Reservation Request Sent",
                description: "We have received your request and will be in touch shortly.",
            });
            setShowGuestReserveDialog(false);
        } catch (error) {
            console.error("Reservation failed", error);
            toast({ title: "Error", description: "Failed to send reservation request.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendGuestReservationEmails = async (payload, dateDetails) => {
        const formattedDate = formatDateRange(payload.selectedDate, dateDetails.endDate);

        const emailToAdminBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">New Course Reservation Request</h1>
                <p>A user has requested to reserve a place on a course.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><strong>Course:</strong> ${payload.courseTitle}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${payload.selectedTime}</p>
                <p><strong>Location:</strong> ${payload.selectedLocation}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Name:</strong> ${payload.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${payload.email}" style="color: #5e028f;">${payload.email}</a></p>
                <p><strong>Phone:</strong> ${payload.phoneNumber}</p>
                <p><strong>Organisation:</strong> ${payload.organisation || 'N/A'}</p>
            </td>`;

        const userEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">Reservation Request Received</h1>
                <p>Dear ${payload.name},</p>
                <p>Thank you for your request to reserve a place on: <strong>${payload.courseTitle}</strong>.</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p>We have received your details and a member of our team will be in touch shortly to confirm your booking and arrange payment.</p>
                <p style="margin-top: 30px; margin-bottom: 5px;">Kind regards,</p>
                <p style="margin-top: 0; font-weight: bold;">The Independent Federation for Safeguarding</p>
            </td>`;

        await Promise.all([
            sendEmail({ to: 'info@ifs-safeguarding.co.uk', subject: `Reservation Request: ${payload.courseTitle}`, html: getEmailWrapper(emailToAdminBody) }),
            sendEmail({ to: payload.email, subject: `Reservation Request Received: ${payload.courseTitle}`, html: getEmailWrapper(userEmailBody) })
        ]);
    };

    const calculateBulkDiscountPercentage = (participants) => {
        if (course && course.title === "Trauma Informed Practice" && participants > 1) {
            return 50;
        }
        if (participants >= 21) return 30;
        if (participants >= 11) return 20;
        if (participants >= 6) return 15;
        if (participants >= 4) return 10;
        return 0;
    };

    const calculateQuote = (participants, isMemberCheck) => {
        if (!course) return null;
        
        const courseCpdHours = course.cpdHours || 0;
        const basePricePerPerson = courseCpdHours * 20;
        const basePrice = basePricePerPerson * participants;
        
        const bulkDiscountPercentage = calculateBulkDiscountPercentage(participants);
        const bulkDiscountAmount = basePrice * (bulkDiscountPercentage / 100);
        const priceAfterBulk = basePrice - bulkDiscountAmount;
        
        let memberDiscountAmount = 0;
        let finalPrice = priceAfterBulk;
        
        if (isMemberCheck) {
            memberDiscountAmount = priceAfterBulk * 0.1;
            finalPrice = priceAfterBulk * 0.9;
        }
        
        return {
            basePrice,
            bulkDiscountPercentage,
            bulkDiscountAmount,
            memberDiscountAmount,
            finalPrice,
            pricePerParticipant: finalPrice / participants
        };
    };

    const calculatePaymentBreakdown = () => {
        if (!user || !course) return { 
            basePrice: 0,
            cpdHoursUsed: 0, 
            cpdDiscount: 0,
            priceAfterCpdDiscount: 0,
            memberDiscountAmount: 0,
            memberDiscountPercentage: 0,
            bulkDiscountPercentage: 0,
            bulkDiscountAmount: 0,
            pricePerParticipant: 0,
            finalPrice: 0, 
            userCpdHours: 0 
        };
        
        const isFullMember = user.membershipStatus === 'active' && (user.membershipType === 'Full' || user.membershipType === 'Fellow');
        const courseCpdHours = course.cpdHours || 0;
        const basePricePerPerson = courseCpdHours * 20;
        const basePrice = basePricePerPerson * numberOfParticipants;
        
        const bulkDiscountPercentage = calculateBulkDiscountPercentage(numberOfParticipants);
        const bulkDiscountAmount = basePrice * (bulkDiscountPercentage / 100);
        const priceAfterBulkDiscount = basePrice - bulkDiscountAmount;
        
        const userAvailableHours = user.cpdHours || 0;
        const maxHoursForCourse = Math.floor(priceAfterBulkDiscount / 20 * 10) / 10;
        const actualHoursToUse = Math.min(cpdHoursToUse, userAvailableHours, maxHoursForCourse);
        
        const cpdDiscountAmount = actualHoursToUse * 20;
        const priceAfterCpdDiscount = Math.max(0, priceAfterBulkDiscount - cpdDiscountAmount);
        
        let finalPriceToPay = priceAfterCpdDiscount;
        let memberDiscountPercentage = 0;
        let memberDiscountAmount = 0;
        
        if (priceAfterCpdDiscount > 0 && isFullMember) {
            memberDiscountPercentage = 10;
            memberDiscountAmount = priceAfterCpdDiscount * 0.1;
            finalPriceToPay = priceAfterCpdDiscount * 0.9;
        }
        
        const pricePerParticipant = finalPriceToPay / numberOfParticipants;
        
        return {
            basePrice,
            cpdHoursUsed: actualHoursToUse,
            cpdDiscount: cpdDiscountAmount,
            priceAfterCpdDiscount,
            memberDiscountAmount,
            memberDiscountPercentage,
            bulkDiscountPercentage,
            bulkDiscountAmount,
            pricePerParticipant,
            finalPrice: finalPriceToPay,
            userCpdHours: userAvailableHours
        };
    };

    const handleBookingConfirm = async () => {
        if (!course || !user || !selectedDateForBooking) return;
        setIsSubmitting(true);

        try {
            const breakdown = calculatePaymentBreakdown();
            const finalPriceToPay = breakdown.finalPrice;

            if (finalPriceToPay === 0) {
                const hoursToDeduct = breakdown.cpdHoursUsed;
                const newBalance = user.cpdHours - hoursToDeduct;
                
                await base44.auth.updateMe({
                    cpdHours: newBalance,
                    totalCpdSpent: (user.totalCpdSpent || 0) + hoursToDeduct
                });

                await base44.entities.CreditTransaction.create({
                    userId: user.id,
                    userEmail: user.email,
                    transactionType: 'spent',
                    amount: -hoursToDeduct,
                    balanceAfter: newBalance,
                    description: `Course booking discount: ${course.title}`,
                    relatedEntityType: 'Course',
                    relatedEntityId: course.id,
                    relatedEntityName: course.title
                });

                await CourseBooking.create({
                    userId: user.id,
                    userEmail: user.email,
                    userName: user.displayName || user.full_name,
                    courseId: course.id,
                    courseTitle: course.title,
                    courseDateId: selectedDateForBooking.id,
                    selectedDate: formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate),
                    selectedTime: `${selectedDateForBooking.startTime} - ${selectedDateForBooking.endTime}`,
                    selectedLocation: selectedDateForBooking.location,
                    paymentMethod: 'credits',
                    creditsUsed: hoursToDeduct,
                    gbpAmount: 0,
                    totalCost: breakdown.basePrice,
                    organisationName: user.organisationName || '',
                    status: 'confirmed',
                    notes: bookingNotes
                });

                toast({
                    title: "Booking Confirmed!",
                    description: `Booking confirmed. ${hoursToDeduct.toFixed(1)} CPD hours deducted.`
                });

                setShowBookingDialog(false);
                setIsSubmitting(false);

            } else {
                const productionOrigin = 'https://www.ifs-safeguarding.co.uk';
                const successUrl = `${productionOrigin}${createPageUrl('TrainingCourseDetails')}?id=${course.id}&payment=success`;
                const cancelUrl = `${productionOrigin}${createPageUrl('TrainingCourseDetails')}?id=${course.id}&payment=cancelled`;

                const { data } = await createDynamicCourseCheckout({
                    courseId: course.id,
                    courseTitle: course.title,
                    variantName: '',
                    courseDateId: selectedDateForBooking.id,
                    selectedDate: formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate),
                    selectedTime: `${selectedDateForBooking.startTime} - ${selectedDateForBooking.endTime}`,
                    selectedLocation: selectedDateForBooking.location,
                    numberOfParticipants: numberOfParticipants,
                    cpdHoursToUse: breakdown.cpdHoursUsed,
                    successUrl,
                    cancelUrl
                });

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Failed to create checkout session');
                }
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast({
                title: "Booking Failed",
                description: error.message || "Could not process booking.",
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Toaster />
            
            {/* Hero Header Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={course?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop"}
                        alt={course?.title || "Professional training course"}
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800/80 to-transparent"></div>
                
                <MainSiteNav />

                {/* Hero Content - Refactored based on outline */}
                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                                </div>
                            ) : !course ? (
                                <div className="text-center py-20">
                                    <h1 className="text-4xl font-bold text-white mb-4">Course Not Found</h1>
                                    <p className="text-purple-200 mb-8">The course you're looking for doesn't exist.</p>
                                    <Link 
                                        to={createPageUrl('Training')}
                                        className="inline-flex items-center text-purple-200 hover:text-white transition-colors text-sm font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Training
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link 
                                        to={createPageUrl('Training')}
                                        className="inline-flex items-center text-purple-200 hover:text-white transition-colors text-sm font-medium mb-4"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Training
                                    </Link>
                                    
                                    <div className="text-sm text-purple-200 mb-4 font-medium tracking-wider uppercase">
                                        <Link to={createPageUrl('Training')} className="hover:text-white transition-colors">
                                            Training
                                        </Link>
                                        <span className="mx-2">/</span>
                                        <span className="text-white">Course Details</span>
                                    </div>
                                    
                                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                        {course.title}
                                    </h1>
                                    
                                    <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed">
                                        <p>{course.description}</p>
                                    </div>

                                    {/* Desktop CTA */}
                                    <div className="hidden lg:inline-flex items-center gap-4">
                                        <Button
                                            onClick={() => {
                                                const detailsSection = document.getElementById('course-details');
                                                if (detailsSection) {
                                                    detailsSection.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                            size="lg"
                                            className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                        >
                                            View Details & Book
                                        </Button>
                                        {course.prospectusUrl && (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                            >
                                                <a href={course.prospectusUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Prospectus
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Mobile CTA */}
                                    <div className="mt-8 lg:hidden flex flex-col gap-3">
                                        <Button
                                            onClick={handleJoin}
                                            size="lg"
                                            className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                            Become a Member for Free
                                        </Button>
                                        {course.prospectusUrl && (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto"
                                            >
                                                <a href={course.prospectusUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Prospectus
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="hidden lg:block"></div> {/* Empty column for layout */}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            {!loading && course && (
                <main id="course-details" className="min-h-[calc(100vh-64px)] bg-slate-50">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <section className="pb-12">
                            <div className="lg:flex lg:gap-12">
                                {/* Left Column - Course Content */}
                                <div className="lg:flex-1">
                                    <div className="space-y-8">
                                        {/* Course Overview Card */}
                                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-8 py-6 border-b border-slate-200">
                                                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                                    <BookOpen className="w-7 h-7 mr-3 text-purple-600" />
                                                    Course Overview
                                                </h2>
                                            </div>
                                            <div className="p-8">
                                                <p className="text-slate-700 leading-relaxed text-lg">{course.overview || course.description}</p>
                                            </div>
                                        </div>

                                        {/* What You'll Learn - Always Visible */}
                                        {course.objectives && course.objectives.length > 0 && (
                                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                                <div className="px-8 py-6 border-b border-slate-200">
                                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                                        <Target className="w-7 h-7 mr-3 text-purple-600" />
                                                        What You'll Learn
                                                        <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                                                            {course.objectives.length} Key Objectives
                                                        </span>
                                                    </h2>
                                                </div>
                                                <div className="p-8">
                                                    <div className="space-y-4">
                                                        {course.objectives.slice(0, 3).map((objective, index) => (
                                                            <div key={index} className="flex items-start">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                                                                    <span className="text-slate-600 font-bold text-sm">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1 pt-1">
                                                                    <p className="text-slate-700 leading-relaxed text-base font-medium">{objective}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {course.objectives.length > 3 && (
                                                        <>
                                                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                                                expandedSections.objectives ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                                            }`}>
                                                                <div className="space-y-4 pt-4">
                                                                    {course.objectives.slice(3).map((objective, index) => (
                                                                        <div key={index + 3} className="flex items-start">
                                                                            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                                                                                <span className="text-slate-600 font-bold text-sm">{index + 4}</span>
                                                                            </div>
                                                                            <div className="flex-1 pt-1">
                                                                                <p className="text-slate-700 leading-relaxed text-base font-medium">{objective}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleSection('objectives')}
                                                                className="mt-6 flex items-center justify-center w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
                                                            >
                                                                <span className="text-slate-600 font-semibold mr-2 text-sm">
                                                                    {expandedSections.objectives 
                                                                        ? 'Show Less' 
                                                                        : `Show ${course.objectives.length - 3} More Learning Objectives`
                                                                    }
                                                                </span>
                                                                {expandedSections.objectives ? (
                                                                    <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Course Benefits - Preview with Expand */}
                                        {course.benefits && course.benefits.length > 0 && (
                                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                                <div className="px-8 py-6 border-b border-slate-200">
                                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                                        <Award className="w-7 h-7 mr-3 text-purple-600" />
                                                        Key Benefits & Outcomes
                                                        <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                                                            {course.benefits.length} Benefits
                                                        </span>
                                                    </h2>
                                                </div>
                                                <div className="p-8">
                                                    <div className="space-y-4">
                                                        {course.benefits.slice(0, 2).map((benefit, index) => (
                                                            <div key={index} className="flex items-start">
                                                                <CheckCircleIcon className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                                                <span className="text-slate-700 leading-relaxed font-medium">{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {course.benefits.length > 2 && (
                                                        <>
                                                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                                                expandedSections.benefits ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                                            }`}>
                                                                <div className="space-y-4 pt-4">
                                                                    {course.benefits.slice(2).map((benefit, index) => (
                                                                        <div key={index + 2} className="flex items-start">
                                                                            <CheckCircleIcon className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                                                            <span className="text-slate-700 leading-relaxed font-medium">{benefit}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleSection('benefits')}
                                                                className="mt-6 flex items-center justify-center w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
                                                            >
                                                                <span className="text-slate-600 font-semibold mr-2 text-sm">
                                                                    {expandedSections.benefits 
                                                                        ? 'Show Less Benefits' 
                                                                        : `View All ${course.benefits.length} Benefits`
                                                                    }
                                                                </span>
                                                                {expandedSections.benefits ? (
                                                                    <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* FAQ Section - Compact Preview */}
                                        {course.faq && course.faq.length > 0 && (
                                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                                <div className="px-8 py-6 border-b border-slate-200">
                                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                                        <div className="w-7 h-7 mr-3 bg-slate-200 rounded-full flex items-center justify-center">
                                                            <span className="text-slate-600 font-bold text-sm">?</span>
                                                        </div>
                                                        Frequently Asked Questions
                                                        <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full">
                                                            {course.faq.length} Questions
                                                        </span>
                                                    </h2>
                                                </div>
                                                
                                                <div className="p-8">
                                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-4">
                                                        <h4 className="font-bold text-slate-900 mb-3 text-base">
                                                            {course.faq[0].question}
                                                        </h4>
                                                        <p className="text-slate-700 leading-relaxed text-sm">{course.faq[0].answer}</p>
                                                    </div>

                                                    {course.faq.length > 1 && (
                                                        <>
                                                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                                                expandedSections.faq ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                                            }`}>
                                                                <div className="space-y-4">
                                                                    {course.faq.slice(1).map((item, index) => (
                                                                        <div key={index + 1} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                                                            <h4 className="font-bold text-slate-900 mb-3 text-base">
                                                                                {item.question}
                                                                            </h4>
                                                                            <p className="text-slate-700 leading-relaxed text-sm">{item.answer}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleSection('faq')}
                                                                className="mt-4 flex items-center justify-center w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
                                                            >
                                                                <span className="text-slate-600 font-semibold mr-2 text-sm">
                                                                    {expandedSections.faq 
                                                                        ? 'Show Fewer Questions' 
                                                                        : `See ${course.faq.length - 1} More Questions`
                                                                    }
                                                                </span>
                                                                {expandedSections.faq ? (
                                                                    <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Course Info & Booking */}
                                <div className="lg:w-96 mt-8 lg:mt-0">
                                    <div className="lg:sticky lg:top-8">
                                        {/* Course Overview Card */}
                                        <Card className="bg-purple-700 text-white rounded-xl shadow-2xl overflow-hidden">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3 text-xl">
                                                    <BookOpen className="w-6 h-6" /> Course Overview
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 text-sm">
                                                {(course?.cpdHours > 0 || displayData.duration) && (
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-5 h-5 opacity-80 flex-shrink-0" />
                                                        <span className="font-medium">
                                                            {course?.cpdHours > 0 
                                                                ? `${course.cpdHours} CPD ${course.cpdHours === 1 ? 'Hour' : 'Hours'}`
                                                                : displayData.duration
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {displayData.format && displayData.format.length > 0 && (
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="w-5 h-5 opacity-80 flex-shrink-0" />
                                                        <span className="font-medium">{displayData.format.join(' / ')}</span>
                                                    </div>
                                                )}
                                                {displayData.geography && displayData.geography.length > 0 && (
                                                    <div className="flex items-center gap-3">
                                                        <Globe className="w-5 h-5 opacity-80 flex-shrink-0" />
                                                        <span className="font-medium">{displayData.geography.join(' / ')}</span>
                                                    </div>
                                                )}
                                                {course?.level && (
                                                    <div className="flex items-center gap-3">
                                                        <Users className="w-5 h-5 opacity-80 flex-shrink-0" />
                                                        <span className="font-medium">{course.level === 'Foundation' ? 'New to safeguarding' : course.level}</span>
                                                    </div>
                                                )}
                                                {course?.certification && (
                                                    <div className="flex items-center gap-3">
                                                        <Award className="w-5 h-5 opacity-80 flex-shrink-0" />
                                                        <span className="font-medium">{course.certification}</span>
                                                    </div>
                                                    )}
                                                    </div>
                                                    </CardContent>
                                                    </Card>

                                        <Card className="mt-4 rounded-xl shadow-lg">
                                            <CardHeader className="pb-2 border-b border-gray-100">
                                                <CardTitle className="text-lg font-bold text-slate-900">Pricing & Booking</CardTitle>
                                            </CardHeader>
                                            <div className="p-6 space-y-6">

                                                {/* Pricing Section */}
                                                <div>
                                                    {course?.title === "Trauma Informed Practice" && (
                                                        <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                                            <div className="flex items-center gap-2 text-pink-800 font-bold mb-1">
                                                                <Users className="w-4 h-4" />
                                                                <span>Special Offer: 50% Off Groups!</span>
                                                            </div>
                                                            <p className="text-xs text-pink-700">
                                                                Book for 2+ people and get 50% off per person.
                                                            </p>
                                                        </div>
                                                    )}
                                                    <Label className="text-sm font-semibold text-slate-900 mb-3 block">Calculate Your Price</Label>
                                                    
                                                    {/* CPD Info for logged-in users */}
                                                    {user && user.cpdHours > 0 && course.cpdHours > 0 && (
                                                        <div className="mb-4 flex items-center gap-2 text-xs text-amber-800 bg-amber-50/80 px-3 py-2 rounded-md border border-amber-200/50">
                                                            <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                                            <span>
                                                                You have <span className="font-bold">{user.cpdHours.toFixed(1)} CPD hours</span> available to use at checkout.
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs text-slate-500 mb-1.5 block">Number of Participants</Label>
                                                            <Input 
                                                                type="number" 
                                                                min="1" 
                                                                max="100" 
                                                                value={quoteParticipants}
                                                                onChange={(e) => setQuoteParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="h-10"
                                                            />
                                                        </div>

                                                        {(() => {
                                                            const isMember = user && user.membershipStatus === 'active' && (user.membershipType === 'Full' || user.membershipType === 'Fellow');
                                                            const quote = calculateQuote(quoteParticipants, isMember);
                                                            return quote ? (
                                                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                                    <div className="flex justify-between items-end">
                                                                        <div>
                                                                            <p className="text-xs text-slate-500">Total Estimate</p>
                                                                            <div className="flex items-baseline gap-2">
                                                                                <span className="text-xl font-bold text-purple-700">£{quote.finalPrice.toFixed(2)}</span>
                                                                                {quoteParticipants > 1 && (
                                                                                    <span className="text-xs text-slate-500">
                                                                                        (£{quote.pricePerParticipant.toFixed(2)} / person)
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {(quote.bulkDiscountPercentage > 0 || quote.memberDiscountAmount > 0) && (
                                                                            <div className="text-right text-xs">
                                                                                {quote.bulkDiscountPercentage > 0 && (
                                                                                    <p className="text-green-600 font-medium">{quote.bulkDiscountPercentage}% Bulk Savings</p>
                                                                                )}
                                                                                {quote.memberDiscountAmount > 0 && (
                                                                                    <p className="text-purple-600 font-medium">Member Discount</p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                                                                    <p className="text-sm font-bold text-green-800">Included with Membership</p>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                                <div className="h-px bg-gray-100"></div>

                                                {/* Booking Section */}
                                                <div>
                                                    <Label className="text-sm font-semibold text-slate-900 mb-3 block">Select a Date to Book</Label>

                                                    {!enquirySubmitted ? (
                                                        <div className="space-y-3">
                                                            {courseDates.length > 0 ? (
                                                                <>
                                                                    {courseDates.map(date => (
                                                                        <div key={date.id} className="p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all group">
                                                                            <div className="mb-2">
                                                                                <div className="font-semibold text-slate-800 text-sm">
                                                                                    {date.endDate && date.endDate !== date.date
                                                                                        ? `${formatDate(new Date(date.date), 'd MMM')} - ${formatDate(new Date(date.endDate), 'd MMM yyyy')}`
                                                                                        : formatDate(new Date(date.date), 'EEE, d MMMM yyyy')
                                                                                    }
                                                                                </div>
                                                                                <div className="text-xs text-slate-500 mt-1">
                                                                                    {date.startTime} - {date.endTime} • {date.location}
                                                                                </div>
                                                                            </div>

                                                                            {date.status === 'Full' ? (
                                                                                <Button size="sm" variant="secondary" disabled className="w-full">Full</Button>
                                                                            ) : bookedDateIds.includes(date.id) ? (
                                                                                <Button size="sm" variant="outline" disabled className="w-full border-green-200 bg-green-50 text-green-700 opacity-100">
                                                                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                                                    Booked
                                                                                </Button>
                                                                            ) : (
                                                                                <div className="space-y-2">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        onClick={() => handleBookNowClick(date)}
                                                                                        className="w-full bg-purple-600 hover:bg-purple-700 shadow-sm group-hover:shadow-md"
                                                                                    >
                                                                                        {user ? "Book Now" : "Reserve Your Place"}
                                                                                    </Button>
                                                                                    {user && user.organisationId && user.organisationRole === 'Admin' && (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => handleOrgBulkBookClick(date)}
                                                                                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                                                                                        >
                                                                                            <Users className="w-3 h-3 mr-1" />
                                                                                            Book for Team
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}

                                                                    {!showEnquiryForm && (
                                                                        <button 
                                                                            onClick={() => setShowEnquiryForm(true)}
                                                                            className="w-full text-center text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 underline decoration-purple-300 underline-offset-2"
                                                                        >
                                                                            Can't make these dates? Enquire here
                                                                        </button>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                                                    <p className="text-sm text-slate-500 mb-2">No upcoming dates scheduled.</p>
                                                                    <Button 
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => setShowEnquiryForm(true)}
                                                                    >
                                                                        Request a Date
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {showEnquiryForm && courseDates.length > 0 && (
                                                                <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h5 className="text-xs font-bold uppercase text-slate-500">General Enquiry</h5>
                                                                        <button onClick={() => setShowEnquiryForm(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                                                                    </div>
                                                                    {/* Simplified Enquiry Form for Sidebar */}
                                                                    <form onSubmit={handleEnquirySubmit} className="space-y-3">
                                                                        <Input
                                                                            placeholder="Your Name"
                                                                            value={enquiryData.name}
                                                                            onChange={(e) => setEnquiryData({ ...enquiryData, name: e.target.value })}
                                                                            required
                                                                            className="h-8 text-sm"
                                                                        />
                                                                        <Input
                                                                            type="email"
                                                                            placeholder="Email Address"
                                                                            value={enquiryData.email}
                                                                            onChange={(e) => setEnquiryData({ ...enquiryData, email: e.target.value })}
                                                                            required
                                                                            className="h-8 text-sm"
                                                                        />
                                                                        <Input
                                                                            type="tel"
                                                                            placeholder="Phone Number"
                                                                            value={enquiryData.phoneNumber}
                                                                            onChange={(e) => setEnquiryData({ ...enquiryData, phoneNumber: e.target.value })}
                                                                            required
                                                                            className="h-8 text-sm"
                                                                        />
                                                                        <Textarea
                                                                            placeholder="Message..."
                                                                            value={enquiryData.message}
                                                                            onChange={(e) => setEnquiryData({ ...enquiryData, message: e.target.value })}
                                                                            className="text-sm min-h-[60px]"
                                                                        />
                                                                        <Button type="submit" size="sm" disabled={isSubmitting} className="w-full bg-slate-800">
                                                                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send Enquiry"}
                                                                        </Button>
                                                                    </form>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
                                                            <CheckCircleIcon className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                                            <h4 className="font-bold text-green-900 text-sm">Enquiry Sent!</h4>
                                                            <p className="text-xs text-green-700 mt-1 px-2">We'll be in touch shortly.</p>
                                                            <Button variant="ghost" size="sm" onClick={() => setEnquirySubmitted(false)} className="mt-2 text-green-700 hover:text-green-800 hover:bg-green-100">
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <MarketingFooter />
                </main>
            )}

            {/* Guest Reservation Dialog */}
            <Dialog open={showGuestReserveDialog} onOpenChange={setShowGuestReserveDialog}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Reserve Your Place</DialogTitle>
                        <DialogDescription>
                            Please provide your details to reserve a spot. We will contact you to finalize the booking.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedDateForBooking && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                            <p className="text-sm font-semibold text-slate-800">
                                {selectedDateForBooking.endDate && selectedDateForBooking.endDate !== selectedDateForBooking.date
                                    ? `${formatDate(new Date(selectedDateForBooking.date), 'd MMM')} - ${formatDate(new Date(selectedDateForBooking.endDate), 'd MMM yyyy')}`
                                    : formatDate(new Date(selectedDateForBooking.date), 'EEEE, d MMMM yyyy')
                                }
                            </p>
                            <p className="text-xs text-slate-600 mt-1">{selectedDateForBooking.startTime} - {selectedDateForBooking.endTime} • {selectedDateForBooking.location}</p>
                        </div>
                    )}

                    <form onSubmit={handleGuestReservationSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="reserve-name" className="text-sm font-medium">Name *</Label>
                            <Input
                                id="reserve-name"
                                value={guestReserveData.name}
                                onChange={(e) => setGuestReserveData({ ...guestReserveData, name: e.target.value })}
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reserve-org" className="text-sm font-medium">Organisation *</Label>
                            <Input
                                id="reserve-org"
                                value={guestReserveData.organisation}
                                onChange={(e) => setGuestReserveData({ ...guestReserveData, organisation: e.target.value })}
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reserve-email" className="text-sm font-medium">Email Address *</Label>
                            <Input
                                id="reserve-email"
                                type="email"
                                value={guestReserveData.email}
                                onChange={(e) => setGuestReserveData({ ...guestReserveData, email: e.target.value })}
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reserve-phone" className="text-sm font-medium">Phone Number *</Label>
                            <Input
                                id="reserve-phone"
                                type="tel"
                                value={guestReserveData.phoneNumber}
                                onChange={(e) => setGuestReserveData({ ...guestReserveData, phoneNumber: e.target.value })}
                                required
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setShowGuestReserveDialog(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Reserve Place"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Org Bulk Booking Modal */}
            {bulkBookingDate && (
                <OrgBulkBookingModal
                    open={showOrgBulkBookingModal}
                    onClose={() => {
                        setShowOrgBulkBookingModal(false);
                        setBulkBookingDate(null);
                    }}
                    course={course}
                    variantId={null}
                    variantName=""
                    selectedDate={bulkBookingDate.endDate && bulkBookingDate.endDate !== bulkBookingDate.date
                        ? `${formatDate(new Date(bulkBookingDate.date), 'd MMM')} - ${formatDate(new Date(bulkBookingDate.endDate), 'd MMM yyyy')}`
                        : formatDate(new Date(bulkBookingDate.date), 'EEEE, d MMMM yyyy')
                    }
                    selectedTime={`${bulkBookingDate.startTime} - ${bulkBookingDate.endTime}`}
                    selectedLocation={bulkBookingDate.location}
                    user={user}
                />
            )}

            {/* Booking Dialog */}
            <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Confirm Your Booking</DialogTitle>
                        <DialogDescription>
                            {course?.cpdHours > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                                    <Award className="w-4 h-4" />
                                    This course is worth {course.cpdHours} CPD {course.cpdHours === 1 ? 'hour' : 'hours'}!
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedDateForBooking && user && (
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-sm font-semibold text-slate-800">
                                    {selectedDateForBooking.endDate && selectedDateForBooking.endDate !== selectedDateForBooking.date
                                        ? `${formatDate(new Date(selectedDateForBooking.date), 'd MMM')} - ${formatDate(new Date(selectedDateForBooking.endDate), 'd MMM yyyy')}`
                                        : formatDate(new Date(selectedDateForBooking.date), 'EEEE, d MMMM yyyy')
                                    }
                                </p>
                                <p className="text-xs text-slate-600 mt-1">{selectedDateForBooking.startTime} - {selectedDateForBooking.endTime} • {selectedDateForBooking.location}</p>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Label className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Number of Participants
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={numberOfParticipants}
                                    onChange={(e) => setNumberOfParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="mt-2"
                                />
                                {calculatePaymentBreakdown().bulkDiscountPercentage > 0 && (
                                    <p className="text-xs text-green-700 mt-2 font-semibold">
                                        🎉 {calculatePaymentBreakdown().bulkDiscountPercentage}% bulk discount applied!
                                    </p>
                                )}
                            </div>

                            {user.cpdHours > 0 && course.cpdHours > 0 && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm font-bold text-amber-900">Use CPD Hours</Label>
                                        <span className="text-xs text-amber-700">Available: {user.cpdHours.toFixed(1)}</span>
                                    </div>
                                    <Input
                                        type="range"
                                        min="0"
                                        max={Math.min(user.cpdHours, Math.floor((course.cpdHours * 20 * numberOfParticipants) / 20))}
                                        step="0.1"
                                        value={cpdHoursToUse}
                                        onChange={(e) => setCpdHoursToUse(parseFloat(e.target.value))}
                                        className="w-full mt-2"
                                    />
                                    <p className="text-xs text-amber-800 mt-2">
                                        Using {cpdHoursToUse.toFixed(1)} hours = £{(cpdHoursToUse * 20).toFixed(2)} off
                                    </p>
                                </div>
                            )}

                            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Payment Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                    {(() => {
                                        const breakdown = calculatePaymentBreakdown();
                                        return (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Course Price:</span>
                                                    <span className="font-medium">£{breakdown.basePrice.toFixed(2)}</span>
                                                </div>
                                                {breakdown.bulkDiscountPercentage > 0 && (
                                                    <div className="flex justify-between text-green-700">
                                                        <span>Bulk Discount ({breakdown.bulkDiscountPercentage}%):</span>
                                                        <span>-£{breakdown.bulkDiscountAmount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {breakdown.cpdHoursUsed > 0 && (
                                                    <div className="flex justify-between text-amber-700">
                                                        <span>CPD Discount ({breakdown.cpdHoursUsed.toFixed(1)}h):</span>
                                                        <span>-£{breakdown.cpdDiscount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {breakdown.memberDiscountAmount > 0 && (
                                                    <div className="flex justify-between text-green-700">
                                                        <span>Member Discount (10%):</span>
                                                        <span>-£{breakdown.memberDiscountAmount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t-2 border-purple-300 flex justify-between text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span className="text-purple-700">£{breakdown.finalPrice.toFixed(2)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bookingNotes" className="text-sm">Additional Notes</Label>
                                <Textarea
                                    id="bookingNotes"
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    className="mt-1"
                                    placeholder="Any special requirements?"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBookingDialog(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleBookingConfirm}
                            disabled={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : calculatePaymentBreakdown().finalPrice === 0 ? (
                               <>Confirm Booking</>
                            ) : (
                               <>Pay £{calculatePaymentBreakdown().finalPrice.toFixed(2)}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
