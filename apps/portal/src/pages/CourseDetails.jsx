import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Course } from '@ifs/shared/api/entities';
import { CourseVariant } from '@ifs/shared/api/entities';
import { CourseDate } from '@ifs/shared/api/entities';
import { CourseBooking } from '@ifs/shared/api/entities';
import { Loader2, Check, Info, Shield, BookOpen, Clock, Tv, MapPin, ArrowLeft, ArrowRight, CheckCircle, User, CalendarDays, Award, Globe, Users, Coins, CreditCard, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@ifs/shared/components/ui/button';
import { createPageUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ifs/shared/components/ui/accordion";
import { TrainingEnquiry } from '@ifs/shared/api/entities';
import { sendEmail } from '@ifs/shared/api/functions';
import { createDynamicCourseCheckout } from '@ifs/shared/api/functions';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Label } from '@ifs/shared/components/ui/label';
import { format } from 'date-fns';
import { Badge } from '@ifs/shared/components/ui/badge';
import LoginPrompt from '../components/portal/LoginPrompt';
import { customLoginWithRedirect } from '../components/utils/auth';
import { formatDateRange } from '../components/utils/formatters';
import { ifs } from '@ifs/shared/api/ifsClient';
import OrgBulkBookingModal from '../components/portal/OrgBulkBookingModal';
import { wrapEmailHtml } from '@ifs/shared/emails/wrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ifs/shared/components/ui/dialog";

const CPD_HOUR_VALUE = 20; // Each CPD hour is worth £20 discount

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

export default function CourseDetails() {
    const { user, loading: userLoading, refreshUser } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [course, setCourse] = useState(null);
    const [variant, setVariant] = useState(null);
    const [scheduledDates, setScheduledDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enquirySubmitted, setEnquirySubmitted] = useState(false);
    const [requestedDateIds, setRequestedDateIds] = useState([]);
    const [enquiryData, setEnquiryData] = useState({ name: '', email: '', message: '', phoneNumber: '', organisation: '', numberOfParticipants: 1 });
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [selectedDateForBooking, setSelectedDateForBooking] = useState(null);
    const [cpdHoursToUse, setCpdHoursToUse] = useState(0); // State for CPD hours to be used
    const [bookingNotes, setBookingNotes] = useState('');
    const [numberOfParticipants, setNumberOfParticipants] = useState(1); // Number of participants
    const [showGuestReserveDialog, setShowGuestReserveDialog] = useState(false);
    const [guestReserveData, setGuestReserveData] = useState({ name: '', email: '', organisation: '', phoneNumber: '' });
    const [showOrgBulkBookingModal, setShowOrgBulkBookingModal] = useState(false);
    const [selectedDateForOrgBooking, setSelectedDateForOrgBooking] = useState(null);
    const query = useQuery();
    const courseId = query.get('courseId');
    const variantId = query.get('variantId');
    const { toast } = useToast();
    
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        // Skip onboarding redirect if we are in the middle of an auto-booking flow
        if (searchParams.get('autoBook')) return;

        if (!userLoading && user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, userLoading]);

    const handleGuestReserveClick = (date) => {
        setSelectedDateForBooking(date);
        setGuestReserveData({ name: '', email: '', organisation: '', phoneNumber: '' });
        setShowGuestReserveDialog(true);
    };

    const handleGuestReservationSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const reservationPayload = {
                courseTitle: course.title + (variant ? ` (${variant.name})` : ''),
                courseId: course.id,
                name: guestReserveData.name,
                email: guestReserveData.email,
                phoneNumber: guestReserveData.phoneNumber,
                organisation: guestReserveData.organisation,
                message: `Reservation request for ${selectedDateForBooking.datePatternDescription || formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate)}`,
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
        const emailWrapper = (content) => wrapEmailHtml(content);

        const formattedDate = dateDetails.datePatternDescription || formatDateRange(payload.selectedDate, dateDetails.endDate);

        const adminEmailBody = `
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
            sendEmail({ to: 'info@ifs-safeguarding.co.uk', subject: `Reservation Request: ${payload.courseTitle}`, body: emailWrapper(adminEmailBody) }),
            sendEmail({ to: payload.email, subject: `Reservation Request Received: ${payload.courseTitle}`, body: emailWrapper(userEmailBody) })
        ]);
    };

    useEffect(() => {
        const fetchUserBookings = async () => {
            if (user && course) {
                try {
                    const bookings = await CourseBooking.filter({
                        userId: user.id,
                        courseId: course.id,
                        status: 'confirmed'
                    });
                    const bookedIds = bookings.map(b => b.courseDateId).filter(id => id);
                    setRequestedDateIds(prev => [...new Set([...prev, ...bookedIds])]);
                } catch (err) {
                    console.error("Failed to fetch existing bookings", err);
                }
            }
        };
        fetchUserBookings();
    }, [user, course]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const autoBook = searchParams.get('autoBook');
        const dateId = searchParams.get('dateId');

        const processAutoBooking = async () => {
            if (autoBook && user && !isSubmitting && !loading && scheduledDates.length > 0) {
                const dateToBook = scheduledDates.find(d => d.id === dateId);
                if (dateToBook) {
                    setIsSubmitting(true);
                    try {
                        // Calculate default price (1 participant, 0 CPD hours used)
                        // We can skip full breakdown calc since we know defaults for new users
                        
                        const productionOrigin = 'https://www.ifs-safeguarding.co.uk';
                        // If user hasn't completed onboarding, send them there after success
                        const targetPage = !user.onboarding_completed ? 'Onboarding' : 'CourseDetails';
                        const successUrl = `${productionOrigin}${createPageUrl(targetPage)}?courseId=${courseId}&payment=success&session_id={CHECKOUT_SESSION_ID}`;
                        const cancelUrl = `${productionOrigin}${createPageUrl('CourseDetails')}?courseId=${courseId}&payment=cancelled`;

                        const { data } = await createDynamicCourseCheckout({
                            courseId: course.id,
                            courseTitle: course.title,
                            variantName: variant?.name,
                            courseDateId: dateToBook.id,
                            selectedDate: dateToBook.datePatternDescription || formatDateRange(dateToBook.date, dateToBook.endDate),
                            selectedTime: `${dateToBook.startTime} - ${dateToBook.endTime}`,
                            selectedLocation: dateToBook.location,
                            numberOfParticipants: 1,
                            cpdHoursToUse: 0,
                            successUrl,
                            cancelUrl
                        });

                        if (data.url) {
                            window.location.href = data.url;
                        } else {
                            throw new Error(data.error || 'Failed to create checkout session');
                        }
                    } catch (error) {
                        console.error("Auto-booking error:", error);
                        toast({
                            title: "Booking Failed",
                            description: error.message || "Could not process booking. Please try again.",
                            variant: "destructive"
                        });
                        setIsSubmitting(false);
                    }
                }
            }
        };

        processAutoBooking();
    }, [user, loading, scheduledDates, isSubmitting]);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) {
                setLoading(false);
                return;
            }
            try {
                const [fetchedCourse, allVariants, allDates] = await Promise.all([
                    Course.get(courseId),
                    CourseVariant.filter({ courseId: courseId }),
                    CourseDate.filter({ courseId: courseId }, '-date'),
                ]);

                if (!fetchedCourse) {
                    toast({ title: "Error", description: "Course not found.", variant: "destructive" });
                    setLoading(false);
                    return;
                }
                setCourse(fetchedCourse);

                let selectedVariant = null;
                if (variantId) {
                    selectedVariant = allVariants.find(v => v.id === variantId);
                } else if (fetchedCourse.defaultVariantId) {
                    selectedVariant = allVariants.find(v => v.id === fetchedCourse.defaultVariantId);
                }
                setVariant(selectedVariant);
                
                const filteredDates = selectedVariant 
                    ? allDates.filter(date => date.variantId === selectedVariant.id || !date.variantId) 
                    : allDates.filter(date => !date.variantId);

                const sortedDates = filteredDates.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateA.getTime() - dateB.getTime();
                    }
                    return a.startTime.localeCompare(b.startTime);
                });
                
                setScheduledDates(sortedDates);

            } catch (error) {
                console.error("Error fetching course details:", error);
                toast({ title: "Error", description: `Failed to load course details. ${error.message}`, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [courseId, variantId, toast]);

    const calculateBulkDiscount = (participants) => {
        if (course && course.title === "Trauma Informed Practice" && participants > 1) {
            return 50;
        }
        if (participants >= 21) return 30;
        if (participants >= 11) return 20;
        if (participants >= 6) return 15;
        if (participants >= 4) return 10;
        return 0;
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
        
        // Step 1: Base price (from CPD hours) × number of participants
        const courseCpdHours = course.cpdHours || 0;
        const basePricePerPerson = courseCpdHours * CPD_HOUR_VALUE;
        const basePrice = basePricePerPerson * numberOfParticipants;
        
        // Step 2: Apply bulk discount
        const bulkDiscountPercentage = calculateBulkDiscount(numberOfParticipants);
        const bulkDiscountAmount = basePrice * (bulkDiscountPercentage / 100);
        const priceAfterBulkDiscount = basePrice - bulkDiscountAmount;
        
        // Step 3: Apply CPD hours discount
        const userAvailableHours = user.cpdHours || 0;
        const maxHoursForCourse = Math.floor(priceAfterBulkDiscount / CPD_HOUR_VALUE * 10) / 10;
        const actualHoursToUse = Math.min(cpdHoursToUse, userAvailableHours, maxHoursForCourse);
        
        const cpdDiscountAmount = actualHoursToUse * CPD_HOUR_VALUE;
        const priceAfterCpdDiscount = Math.max(0, priceAfterBulkDiscount - cpdDiscountAmount);
        
        // Step 4: Apply membership discount to the remaining amount (FULL MEMBERS ONLY)
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

    const handleDateClick = (selectedDate) => {
        setSelectedDateForBooking(selectedDate);
        setNumberOfParticipants(1); // Reset to 1 participant
        // Calculate the base price of the course
        const courseCpdHours = course.cpdHours || 0;
        const basePrice = courseCpdHours * CPD_HOUR_VALUE;

        const userCpdHours = user?.cpdHours || 0;
        // Max hours usable should be based on the original base price
        const maxHoursUsable = Math.floor(basePrice / CPD_HOUR_VALUE * 10) / 10;
        const defaultHours = Math.min(userCpdHours, maxHoursUsable);
        
        setCpdHoursToUse(parseFloat(defaultHours.toFixed(1))); // Set initial value, formatted to 1 decimal
        setBookingNotes('');
        setShowPaymentDialog(true);
    };

    const sendBookingConfirmationEmails = async (bookingDetails) => {
        const emailWrapper = (content) => wrapEmailHtml(content);

        const adminEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">✅ Course Booking Confirmed (Paid with CPD Hours)</h1>
                <p>A member has successfully booked a course using their CPD hours.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><strong>Course:</strong> ${bookingDetails.courseTitle}</p>
                <p><strong>Date:</strong> ${bookingDetails.selectedDate}</p>
                <p><strong>Time:</strong> ${bookingDetails.selectedTime}</p>
                <p><strong>Location:</strong> ${bookingDetails.selectedLocation}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Name:</strong> ${bookingDetails.userName}</p>
                <p><strong>Email:</strong> <a href="mailto:${bookingDetails.userEmail}" style="color: #5e028f;">${bookingDetails.userEmail}</a></p>
                <p><strong>Organisation:</strong> ${bookingDetails.organisationName || 'N/A'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Course Price:</strong> £${bookingDetails.basePrice.toFixed(2)}</p>
                ${bookingDetails.cpdHoursUsed > 0 ? `<p><strong>CPD Discount (${bookingDetails.cpdHoursUsed.toFixed(1)} hour${bookingDetails.cpdHoursUsed !== 1 ? 's' : ''}):</strong> -£${bookingDetails.cpdDiscount.toFixed(2)}</p>` : ''}
                ${bookingDetails.cpdHoursUsed > 0 ? `<p><strong>Price After CPD Discount:</strong> £${bookingDetails.priceAfterCpdDiscount.toFixed(2)}</p>` : ''}
                ${bookingDetails.memberDiscountAmount > 0 ? `<p><strong>Member Discount (${bookingDetails.memberDiscountPercentage}%):</strong> -£${bookingDetails.memberDiscountAmount.toFixed(2)}</p>` : ''}
                <p style="font-size: 18px;"><strong>Final Amount Paid:</strong> £${bookingDetails.finalPrice.toFixed(2)}</p>
                ${bookingDetails.notes ? `<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"><p><strong>Notes:</strong> ${bookingDetails.notes}</p>` : ''}
            </td>`;

        const userEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">🎉 Booking Confirmed!</h1>
                <p>Dear ${bookingDetails.userName},</p>
                <p>Your course booking has been confirmed. You're all set!</p>
                <div style="border-left: 3px solid #5e028f; padding-left: 15px; margin: 20px 0; background-color: #f9f9f9; padding: 15px;">
                    <p style="margin:0;"><strong>Course:</strong> ${bookingDetails.courseTitle}</p>
                    <p style="margin:5px 0 0 0;"><strong>Date:</strong> ${bookingDetails.selectedDate}</p>
                    <p style="margin:5px 0 0 0;"><strong>Time:</strong> ${bookingDetails.selectedTime}</p>
                    <p style="margin:5px 0 0 0;"><strong>Location:</strong> ${bookingDetails.selectedLocation}</p>
                </div>
                <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;">✓ Payment Breakdown:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 5px 0;">Course Price:</td><td style="text-align: right;">£${bookingDetails.basePrice.toFixed(2)}</td></tr>
                        ${bookingDetails.cpdHoursUsed > 0 ? `<tr><td style="padding: 5px 0;">CPD Discount (${bookingDetails.cpdHoursUsed.toFixed(1)} hour${bookingDetails.cpdHoursUsed !== 1 ? 's' : ''}):</td><td style="text-align: right; color: #166534;">-£${bookingDetails.cpdDiscount.toFixed(2)}</td></tr>` : ''}
                        ${bookingDetails.memberDiscountAmount > 0 ? `<tr><td style="padding: 5px 0;">Member Discount (${bookingDetails.memberDiscountPercentage}%):</td><td style="text-align: right; color: #166534;">-£${bookingDetails.memberDiscountAmount.toFixed(2)}</td></tr>` : ''}
                        <tr style="border-top: 2px solid #86efac;"><td style="padding: 10px 0 5px 0; font-weight: bold;">Total Paid:</td><td style="text-align: right; font-weight: bold; padding: 10px 0 5px 0;">£${bookingDetails.finalPrice.toFixed(2)}</td></tr>
                    </table>
                </div>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p style="margin-top: 30px; margin-bottom: 5px;">Kind regards,</p>
                <p style="margin-top: 0; font-weight: bold;">The Independent Federation for Safeguarding</p>
            </td>`;

        await Promise.all([
            sendEmail({ to: 'info@ifs-safeguarding.co.uk', subject: `✅ Course Booked: ${bookingDetails.courseTitle}`, body: emailWrapper(adminEmailBody) }),
            sendEmail({ to: bookingDetails.userEmail, subject: `Booking Confirmed: ${bookingDetails.courseTitle}`, body: emailWrapper(userEmailBody) })
        ]);
    };

    const sendPartialPaymentEmails = async (bookingDetails) => {
        const emailWrapper = (content) => wrapEmailHtml(content);

        const adminEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">💳 Course Booking Request ${bookingDetails.finalPrice > 0 ? '(Invoice Required)' : ''}</h1>
                <p>A member has requested to book a course${bookingDetails.cpdHoursUsed > 0 ? ' and used CPD hours for partial payment' : ''}.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><strong>Course:</strong> ${bookingDetails.courseTitle}</p>
                <p><strong>Date:</strong> ${bookingDetails.selectedDate}</p>
                <p><strong>Time:</strong> ${bookingDetails.selectedTime}</p>
                <p><strong>Location:</strong> ${bookingDetails.selectedLocation}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Name:</strong> ${bookingDetails.userName}</p>
                <p><strong>Email:</strong> <a href="mailto:${bookingDetails.userEmail}" style="color: #5e028f;">${bookingDetails.userEmail}</a></p>
                <p><strong>Organisation:</strong> ${bookingDetails.organisationName || 'N/A'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">💰 Payment Breakdown:</p>
                    <table style="width: 100%;">
                        <tr><td>Course Price:</td><td style="text-align: right;">£${bookingDetails.basePrice.toFixed(2)}</td></tr>
                        ${bookingDetails.cpdHoursUsed > 0 ? `
                        <tr><td>CPD Discount (${bookingDetails.cpdHoursUsed.toFixed(1)} hour${bookingDetails.cpdHoursUsed !== 1 ? 's' : ''}):</td><td style="text-align: right; color: #166534;">-£${bookingDetails.cpdDiscount.toFixed(2)}</td></tr>
                        ` : ''}
                        ${bookingDetails.memberDiscountAmount > 0 ? `<tr><td>Member Discount (${bookingDetails.memberDiscountPercentage}%):</td><td style="text-align: right; color: #166534;">-£${bookingDetails.memberDiscountAmount.toFixed(2)}</td></tr>` : ''}
                        <tr style="border-top: 2px solid #fbbf24;"><td style="padding-top: 10px; font-weight: bold;">⚠️ Invoice Amount Required:</td><td style="text-align: right; font-weight: bold; padding-top: 10px; font-size: 18px; color: #dc2626;">£${bookingDetails.finalPrice.toFixed(2)}</td></tr>
                    </table>
                </div>
                ${bookingDetails.notes ? `<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"><p><strong>Additional Notes:</strong></p><p>${bookingDetails.notes}</p>` : ''}
            </td>`;

        const userEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">Booking Request Received</h1>
                <p>Dear ${bookingDetails.userName},</p>
                <p>Thank you for your interest in our training. We have received your enquiry for the course: <strong>${bookingDetails.courseTitle}</strong>.</p>
                <div style="border-left: 3px solid #5e028f; padding-left: 15px; margin: 20px 0; background-color: #f9f9f9; padding: 15px;">
                    <p style="margin:0;"><strong>Course:</strong> ${bookingDetails.courseTitle}</p>
                    <p style="margin:5px 0 0 0;"><strong>Date:</strong> ${bookingDetails.selectedDate}</p>
                    <p style="margin:5px 0 0 0;"><strong>Time:</strong> ${bookingDetails.selectedTime}</p>
                    <p style="margin:5px 0 0 0;"><strong>Location:</strong> ${bookingDetails.selectedLocation}</p>
                </div>
                ${bookingDetails.cpdHoursUsed > 0 || bookingDetails.memberDiscountAmount > 0 ? `
                <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; color: #166534; font-weight: bold;">✓ Your Discounts:</p>
                    <table style="width: 100%;">
                        <tr><td>Course Price:</td><td style="text-align: right;">£${bookingDetails.basePrice.toFixed(2)}</td></tr>
                        ${bookingDetails.cpdHoursUsed > 0 ? `<tr><td>CPD Discount (${bookingDetails.cpdHoursUsed.toFixed(1)} hour${bookingDetails.cpdHoursUsed !== 1 ? 's' : ''}):</td><td style="text-align: right; color: #166534;">-£${bookingDetails.cpdDiscount.toFixed(2)}</td></tr>` : ''}
                        ${bookingDetails.memberDiscountAmount > 0 ? `<tr><td>Member Discount (${bookingDetails.memberDiscountPercentage}%):</td><td style="text-align: right; color: #166534;">-£${bookingDetails.memberDiscountAmount.toFixed(2)}</td></tr>` : ''}
                        <tr style="border-top: 2px solid #86efac;"><td style="padding: 10px 0 5px 0; font-weight: bold;">Remaining Balance:</td><td style="text-align: right; font-weight: bold; padding: 10px 0 5px 0;">£${bookingDetails.finalPrice.toFixed(2)}</td></tr>
                    </table>
                </div>
                ` : ''}
                <p>A member of our team will be in touch shortly with an invoice for <strong>£${bookingDetails.finalPrice.toFixed(2)}</strong> to confirm your place.</p>
                <p style="margin-top: 30px; margin-bottom: 5px;">Kind regards,</p>
                <p style="margin-top: 0; font-weight: bold;">The Independent Federation for Safeguarding</p>
            </td>`;

        await Promise.all([
            sendEmail({ to: 'info@ifs-safeguarding.co.uk', subject: `Course Booking Request: ${bookingDetails.courseTitle}${bookingDetails.cpdHoursUsed > 0 ? ' (CPD Hours Applied)' : ''}`, body: emailWrapper(adminEmailBody) }),
            sendEmail({ to: bookingDetails.userEmail, subject: `Your IfS Booking Request: ${bookingDetails.courseTitle}`, body: emailWrapper(userEmailBody) })
        ]);
    };

    const handleBookingConfirm = async () => {
        if (!course || !user || !selectedDateForBooking) return;

        setIsSubmitting(true);

        try {
            const breakdown = calculatePaymentBreakdown();
            const finalPriceToPay = breakdown.finalPrice;

            if (finalPriceToPay === 0) {
                // Fully paid with CPD hours - process immediately
                const hoursToDeduct = breakdown.cpdHoursUsed;
                
                // Deduct CPD hours
                const newBalance = user.cpdHours - hoursToDeduct;
                await ifs.auth.updateMe({
                    cpdHours: newBalance,
                    totalCpdSpent: (user.totalCpdSpent || 0) + hoursToDeduct
                });

                // Create CPD transaction
                await ifs.entities.CreditTransaction.create({
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

                // Create booking record
                await CourseBooking.create({
                    userId: user.id,
                    userEmail: user.email,
                    userName: user.displayName || user.full_name,
                    courseId: course.id,
                    courseTitle: course.title + (variant ? ` (${variant.name})` : ''),
                    variantId: variant?.id,
                    variantName: variant?.name,
                    courseDateId: selectedDateForBooking.id,
                    selectedDate: selectedDateForBooking.datePatternDescription || formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate),
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

                // Send confirmation emails
                const emailBookingDetails = {
                    userName: user.displayName || user.full_name,
                    userEmail: user.email,
                    courseTitle: course.title + (variant ? ` (${variant.name})` : ''),
                    selectedDate: selectedDateForBooking.datePatternDescription || formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate),
                    selectedTime: `${selectedDateForBooking.startTime} - ${selectedDateForBooking.endTime}`,
                    selectedLocation: selectedDateForBooking.location,
                    basePrice: breakdown.basePrice,
                    memberDiscountAmount: breakdown.memberDiscountAmount,
                    memberDiscountPercentage: breakdown.memberDiscountPercentage,
                    priceAfterCpdDiscount: breakdown.priceAfterCpdDiscount,
                    cpdHoursUsed: hoursToDeduct,
                    cpdDiscount: breakdown.cpdDiscount,
                    finalPrice: 0,
                    organisationName: user.organisationName || '',
                    notes: bookingNotes
                };

                await sendBookingConfirmationEmails(emailBookingDetails);

                toast({
                    title: "Booking Confirmed!",
                    description: `Your booking has been confirmed. ${hoursToDeduct.toFixed(1)} CPD hour${hoursToDeduct !== 1 ? 's' : ''} deducted.`
                });

                await refreshUser();
                setRequestedDateIds(prev => [...prev, selectedDateForBooking.id]);
                setShowPaymentDialog(false);

            } else {
                // Redirect to Stripe checkout for payment
                const productionOrigin = 'https://www.ifs-safeguarding.co.uk';
                const successUrl = `${productionOrigin}${createPageUrl('CourseDetails')}?courseId=${courseId}&payment=success&session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = `${productionOrigin}${createPageUrl('CourseDetails')}?courseId=${courseId}&payment=cancelled`;

                const { data } = await createDynamicCourseCheckout({
                    courseId: course.id,
                    courseTitle: course.title,
                    variantName: variant?.name,
                    courseDateId: selectedDateForBooking.id,
                    selectedDate: selectedDateForBooking.datePatternDescription || formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate),
                    selectedTime: `${selectedDateForBooking.startTime} - ${selectedDateForBooking.endTime}`,
                    selectedLocation: selectedDateForBooking.location,
                    numberOfParticipants: numberOfParticipants,
                    cpdHoursToUse: breakdown.cpdHoursUsed,
                    successUrl,
                    cancelUrl
                });

                if (data.url) {
                    // Redirect to Stripe
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Failed to create checkout session');
                }
            }

        } catch (error) {
            console.error("Booking error:", error);
            toast({
                title: "Booking Failed",
                description: error.message || "Could not process booking. Please try again.",
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        if (!course) return;
        setIsSubmitting(true);

        const enquiryPayload = {
            courseTitle: course.title + (variant ? ` (${variant.name})` : ''),
            courseId: course.id,
            name: user ? (user.displayName || user.full_name) : enquiryData.name,
            email: user ? user.email : enquiryData.email,
            phoneNumber: enquiryData.phoneNumber,
            organisation: user ? (user.organisationName || '') : (enquiryData.organisation || ''),
            message: enquiryData.message,
            numberOfParticipants: enquiryData.numberOfParticipants || 1,
            status: 'new'
        };

        try {
            await TrainingEnquiry.create(enquiryPayload);
            await sendGeneralEnquiryEmails(enquiryPayload);

            setEnquirySubmitted(true);
            toast({
                title: "Enquiry Sent",
                description: "We'll be in touch shortly with booking details.",
            });
        } catch (error) {
            console.error("Failed to submit enquiry:", error);
            toast({ title: "Submission Failed", description: "There was an error sending your enquiry. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const sendGeneralEnquiryEmails = async (enquiryPayload) => {
        const emailWrapper = (content) => wrapEmailHtml(content);

        const adminEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">New Training Enquiry (Member Portal)</h1>
                <p>A new enquiry has been submitted by a member for a training course.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><strong>Course:</strong> ${enquiryPayload.courseTitle}</p>
                <p><strong>Name:</strong> ${enquiryPayload.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${enquiryPayload.email}" style="color: #5e028f;">${enquiryPayload.email}</a></p>
                <p><strong>Phone:</strong> ${enquiryPayload.phoneNumber}</p>
                <p><strong>Organisation:</strong> ${enquiryPayload.organisation || 'N/A'}</p>
                <p><strong>Number of Participants:</strong> ${enquiryPayload.numberOfParticipants || 1}</p>
                <h2 style="font-size: 20px; margin-top: 20px;">Message:</h2>
                <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
                    <p>${enquiryPayload.message ? enquiryPayload.message.replace(/\n/g, '<br>') : 'No message provided.'}</p>
                </div>
            </td>`;

        const userEmailBody = `
            <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                <h1 style="color: #333; font-size: 24px;">Training Enquiry Received</h1>
                <p>Dear ${enquiryPayload.name},</p>
                <p>Thank you for your interest in our training. We have received your enquiry for the course: <strong>${enquiryPayload.courseTitle}</strong>.</p>
                <p>A member of our team will be in touch shortly to provide more information and answer any questions you may have.</p>
                <p style="margin-top: 30px; margin-bottom: 5px;">Kind regards,</p>
                <p style="margin-top: 0; font-weight: bold;">The Independent Federation for Safeguarding</p>
            </td>`;

        await Promise.all([
            sendEmail({ to: 'info@ifs-safeguarding.co.uk', subject: `Portal Training Enquiry: ${enquiryPayload.courseTitle}`, body: emailWrapper(adminEmailBody) }),
            sendEmail({ to: enquiryPayload.email, subject: `Your IfS Training Enquiry: ${enquiryPayload.courseTitle}`, body: emailWrapper(userEmailBody) })
        ]);
    };
    
    const PriceDisplay = () => {
        if (!course || !user) return null;

        const courseCpdHours = course.cpdHours || 0;
        const basePrice = courseCpdHours * CPD_HOUR_VALUE;

        const isFullMember = user.membershipStatus === 'active' && (user.membershipType === 'Full' || user.membershipType === 'Fellow');

        // Show discount text for Full Members only
        const discountText = isFullMember ? '10% Full Member discount applies' : null;

        return (
            <div className="space-y-6">
                {/* Price */}
                <div>
                    <div className="text-sm text-slate-600 mb-1">Course Price</div>
                    <div className="text-4xl font-bold text-slate-900">
                        {basePrice > 0 ? `£${basePrice.toFixed(2)}` : 'Included with Membership'}
                    </div>
                    {discountText && (
                        <p className="text-sm text-slate-600 mt-1">{discountText}</p>
                    )}
                </div>

                {/* CPD Hours Info */}
                {courseCpdHours > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <div className="text-sm font-medium text-slate-900 mb-1">
                            {courseCpdHours} CPD {courseCpdHours === 1 ? 'Hour' : 'Hours'}
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p>Use your CPD hours to get a discount</p>
                            <p>1 CPD hour = £20 off the course price</p>
                        </div>
                    </div>
                )}

                {/* Group Discount */}
                {course.title === "Trauma Informed Practice" && (
                    <div className="pt-4 border-t border-slate-200">
                        <div className="text-sm font-medium text-slate-900 mb-1">50% Group Discount</div>
                        <div className="text-sm text-slate-600">Book for 2+ participants and get 50% off</div>
                    </div>
                )}
                
                {/* User CPD Balance */}
                {user.cpdHours > 0 && basePrice > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <div className="text-sm font-medium text-slate-900 mb-1">
                            Your CPD Balance: {user.cpdHours.toFixed(1)} hour{user.cpdHours !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-slate-600">
                            Worth £{(user.cpdHours * CPD_HOUR_VALUE).toFixed(2)} in discounts
                        </div>
                    </div>
                )}

                {/* Upgrade prompt */}
                {user.cpdHours === 0 && basePrice > 0 && user.membershipType === 'Associate' && (
                    <div className="pt-4 border-t border-slate-200">
                        <div className="text-sm font-medium text-slate-900 mb-1">Save on training</div>
                        <p className="text-sm text-slate-600 mb-3">
                            Upgrade to Full Membership to earn 1 CPD hour monthly plus get 10% off training courses
                        </p>
                        <Button asChild size="sm" variant="outline">
                            <Link to={createPageUrl('MembershipPlans')}>Learn More</Link>
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const normalizeList = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value.map((item) => String(item).trim()).filter(Boolean);
        }
        if (typeof value === 'object') {
            const candidate =
                value.tags || value.items || value.values || value.value || value.list;
            if (candidate !== undefined) {
                return normalizeList(candidate);
            }
            return normalizeList(Object.values(value));
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return [];
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item).trim()).filter(Boolean);
                }
            } catch {
                // ignore JSON parse errors
            }
            return trimmed.split(/[\n,;|]+/).map((item) => item.trim()).filter(Boolean);
        }
        return [];
    };

    const normalizeFaq = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) {
            return value.filter((item) => item?.question || item?.answer);
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return [];
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.filter((item) => item?.question || item?.answer);
                }
            } catch {
                // ignore JSON parse errors
            }
        }
        return [];
    };

    const getDisplayContent = (field) => {
        const variantItems = normalizeList(variant?.[field]);
        if (variantItems.length > 0) {
            return variantItems;
        }
        return normalizeList(course?.[field]);
    };

    const getDisplayTopics = () => {
        const variantTopics = normalizeList(variant?.tags);
        if (variantTopics.length > 0) {
            return variantTopics;
        }
        const courseTopics = normalizeList(course?.tags);
        if (courseTopics.length > 0) {
            return courseTopics;
        }
        return normalizeList(course?.topicsCovered || course?.topics || course?.topic);
    };

    const getDisplayDescription = () => {
        if (variant && variant.description) {
            return variant.description;
        }
        return course.overview || course.description;
    };
    
    const getDisplayDuration = () => {
        if (variant && variant.duration) {
            return variant.duration;
        }
        return course.duration;
    };

    const getDisplayFormat = () => {
        const variantFormat = normalizeList(variant?.format);
        if (variantFormat.length > 0) {
            return variantFormat;
        }
        return normalizeList(course?.format);
    };

    const getDisplayGeography = () => {
        const variantGeographies = normalizeList(variant?.supportedGeographies);
        if (variantGeographies.length > 0) {
            return variantGeographies;
        }
        return normalizeList(course?.geography);
    };

    const displayOverview = (variant?.overview || course?.overview || '').trim();
    const displayDescription = (variant?.description || course?.description || '').trim();
    const displayFaq = normalizeFaq(course?.faq);

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const courseCpdHours = course?.cpdHours || 0;
    const basePrice = courseCpdHours * CPD_HOUR_VALUE;
    const userCpdHours = user?.cpdHours || 0;
    
    const breakdown = calculatePaymentBreakdown();
    const maxHoursUsable = Math.floor(basePrice / CPD_HOUR_VALUE * 10) / 10;

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="CPDTraining" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
                    {!course ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold">Course not found</h2>
                            <p className="text-slate-600 mt-2">The course you are looking for does not exist.</p>
                            <Button asChild className="mt-4">
                                <Link to={createPageUrl('CPDTraining')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-6">
                                <Button variant="ghost" asChild>
                                    <Link to={`${createPageUrl('CPDTraining')}?category=${course.level}`}>
                                        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Courses
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid lg:grid-cols-5 gap-12">
                                <div className="lg:col-span-3">
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">{course.level}</Badge>
                                                    {courseCpdHours > 0 && (
                                                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold">
                                                            <Award className="w-3 h-3 mr-1" />
                                                            {courseCpdHours} CPD {courseCpdHours === 1 ? 'Hour' : 'Hours'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h1 className="text-4xl font-bold text-slate-900">{course.title}</h1>
                                                {variant && <p className="text-xl text-slate-600 mt-1">{variant.name}</p>}
                                            </div>
                                            {course.prospectusUrl && (
                                                <Button asChild variant="outline" className="bg-white ml-4 shadow-sm hover:bg-slate-50">
                                                    <a href={course.prospectusUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Prospectus
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                        
                                        {/* Course Details Grid - ADD CPD HOURS */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-slate-200">
                                            {courseCpdHours > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-5 h-5 text-amber-600" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">CPD Hours</p>
                                                        <p className="font-semibold text-slate-900">{courseCpdHours} {courseCpdHours === 1 ? 'Hour' : 'Hours'}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {getDisplayDuration() && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-purple-600" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">Duration</p>
                                                        <p className="font-semibold text-slate-900">{getDisplayDuration()}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {getDisplayFormat().length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    {getDisplayFormat().includes('Online') ? (
                                                        <Tv className="w-5 h-5 text-purple-600" />
                                                    ) : (
                                                        <MapPin className="w-5 h-5 text-purple-600" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-slate-500">Format</p>
                                                        <p className="font-semibold text-slate-900">{getDisplayFormat().join(', ')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {getDisplayGeography().length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-5 h-5 text-purple-600" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">Geography</p>
                                                        <p className="font-semibold text-slate-900">{getDisplayGeography().join(', ')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {course.certification && (
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-5 h-5 text-purple-600" />
                                                    <div>
                                                        <p className="text-xs text-slate-500">Certification</p>
                                                        <p className="font-semibold text-slate-900">{course.certification}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {course.imageUrl && (
                                            <div className="relative aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover"/>
                                            </div>
                                        )}

                                        {(displayOverview || displayDescription) && (
                                            <div className="space-y-4">
                                                {displayOverview && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold mb-2">Course Overview</h3>
                                                        <p className="text-slate-700 leading-relaxed">{displayOverview}</p>
                                                    </div>
                                                )}
                                                {displayDescription && displayDescription !== displayOverview && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold mb-2">Course Description</h3>
                                                        <p className="text-slate-700 leading-relaxed">{displayDescription}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {getDisplayTopics().length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Topics Covered</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {getDisplayTopics().map((tag, index) => (
                                                        <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                            {(getDisplayContent('objectives').length > 0 || getDisplayContent('whatYouWillLearn').length > 0) && (
                                                <AccordionItem value="item-1">
                                                    <AccordionTrigger>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4" />
                                                            Learning Objectives
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                                            {getDisplayContent('objectives').length > 0 
                                                                ? getDisplayContent('objectives').map((item, index) => <li key={index}>{item}</li>)
                                                                : getDisplayContent('whatYouWillLearn').map((item, index) => <li key={index}>{item}</li>)
                                                            }
                                                        </ul>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )}
                                            {(getDisplayContent('whoIsItFor').length > 0 || (variant?.targetAudience || course?.targetAudience)) && (
                                                <AccordionItem value="item-2">
                                                    <AccordionTrigger>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            Who is it for?
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        {getDisplayContent('whoIsItFor').length > 0 ? (
                                                            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                                                {getDisplayContent('whoIsItFor').map((item, index) => <li key={index}>{item}</li>)}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-slate-600">{variant?.targetAudience || course?.targetAudience}</p>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )}
                                            {getDisplayContent('benefits').length > 0 && (
                                                <AccordionItem value="item-3">
                                                    <AccordionTrigger>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Key Benefits
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                                            {getDisplayContent('benefits').map((item, index) => <li key={index}>{item}</li>)}
                                                        </ul>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )}
                                            {displayFaq.length > 0 && (
                                                <AccordionItem value="item-4">
                                                    <AccordionTrigger>
                                                        <div className="flex items-center gap-2">
                                                            <Info className="w-4 h-4" />
                                                            Frequently Asked Questions
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <Accordion type="single" collapsible className="w-full">
                                                            {displayFaq.map((item, index) => (
                                                                <AccordionItem value={`faq-${index}`} key={index}>
                                                                    <AccordionTrigger>{item.question}</AccordionTrigger>
                                                                    <AccordionContent>{item.answer}</AccordionContent>
                                                                </AccordionItem>
                                                            ))}
                                                        </Accordion>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )}
                                        </Accordion>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="sticky top-6 bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
                                        <PriceDisplay />
                                        
                                        {scheduledDates.length > 0 ? (
                                            <div className="mt-8 pt-8 border-t border-slate-200">
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                                        Available Dates
                                                    </h3>
                                                    <p className="text-sm text-slate-600">
                                                        {user ? 'Select your preferred date to book' : 'Sign in to complete your booking'}
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {scheduledDates.map(date => (
                                                        <div 
                                                            key={date.id} 
                                                            className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-slate-900 mb-1">
                                                                        {date.datePatternDescription || formatDateRange(date.date, date.endDate)}
                                                                    </p>
                                                                    <div className="text-sm text-slate-600">
                                                                        <p>{date.startTime} - {date.endTime}</p>
                                                                        <p>{date.location}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-2 items-end min-w-[140px]">
                                                                    {date.status === 'Full' ? (
                                                                        <span className="text-sm text-red-600">Fully Booked</span>
                                                                    ) : requestedDateIds.includes(date.id) ? (
                                                                        <span className="text-sm text-green-600">Booked</span>
                                                                    ) : user ? (
                                                                        <>
                                                                            <Button 
                                                                                size="sm"
                                                                                onClick={() => handleDateClick(date)} 
                                                                                disabled={isSubmitting}
                                                                                className="w-full bg-slate-900 hover:bg-slate-800"
                                                                            >
                                                                                Book Now
                                                                            </Button>
                                                                            {user.organisationId && (
                                                                                <Button 
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => {
                                                                                        setSelectedDateForOrgBooking(date);
                                                                                        setShowOrgBulkBookingModal(true);
                                                                                    }}
                                                                                    disabled={isSubmitting}
                                                                                    className="w-full"
                                                                                >
                                                                                    Book for Team
                                                                                </Button>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <Button 
                                                                            size="sm"
                                                                            onClick={() => handleGuestReserveClick(date)} 
                                                                            className="w-full bg-slate-900 hover:bg-slate-800"
                                                                        >
                                                                            Reserve Place
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                </div>
                                        ) : !enquirySubmitted ? (
                                            <div className="mt-8 pt-8 border-t border-slate-200">
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                        Request Booking
                                                    </h3>
                                                    <p className="text-sm text-slate-600">
                                                        Fill in your details and we'll arrange your booking
                                                    </p>
                                                </div>

                                                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                                                 {user ? (
                                                     <div>
                                                         <Label className="text-sm font-medium text-slate-700 mb-2 block">Your Details</Label>
                                                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                             <p className="font-medium text-slate-900 text-sm">{user.displayName || user.full_name}</p>
                                                             <p className="text-slate-600 text-xs">{user.email}</p>
                                                         </div>
                                                     </div>
                                                 ) : (
                                                    <>
                                                        <div>
                                                            <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name *</Label>
                                                            <Input
                                                                id="name"
                                                                value={enquiryData.name}
                                                                onChange={(e) => setEnquiryData({ ...enquiryData, name: e.target.value })}
                                                                required
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email *</Label>
                                                            <Input
                                                                id="email"
                                                                type="email"
                                                                value={enquiryData.email}
                                                                onChange={(e) => setEnquiryData({ ...enquiryData, email: e.target.value })}
                                                                required
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="organisation" className="text-sm font-medium text-slate-700">Organisation</Label>
                                                            <Input
                                                                id="organisation"
                                                                value={enquiryData.organisation}
                                                                onChange={(e) => setEnquiryData({ ...enquiryData, organisation: e.target.value })}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    </>
                                                    )}
                                                    <div>
                                                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">Phone Number *</Label>
                                                        <Input
                                                            id="phoneNumber"
                                                            type="tel"
                                                            value={enquiryData.phoneNumber}
                                                            onChange={(e) => setEnquiryData({ ...enquiryData, phoneNumber: e.target.value })}
                                                            required
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="numberOfParticipants" className="text-sm font-medium text-slate-700">Number of Participants *</Label>
                                                        <Input
                                                            id="numberOfParticipants"
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={enquiryData.numberOfParticipants || 1}
                                                            onChange={(e) => setEnquiryData({ ...enquiryData, numberOfParticipants: Math.max(1, parseInt(e.target.value) || 1) })}
                                                            required
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="message" className="text-sm font-medium text-slate-700">Message (Optional)</Label>
                                                        <Textarea
                                                            id="message"
                                                            value={enquiryData.message}
                                                            onChange={(e) => setEnquiryData({ ...enquiryData, message: e.target.value })}
                                                            className="mt-1"
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        size="lg"
                                                        disabled={isSubmitting || !enquiryData.phoneNumber}
                                                        className="w-full bg-slate-900 hover:bg-slate-800"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            'Submit Enquiry'
                                                        )}
                                                    </Button>
                                                    <p className="text-xs text-slate-500 text-center">We'll email you with available dates and payment details.</p>
                                                    </form>
                                                    </div>
                                                    ) : (
                                                    <div className="text-center py-12 mt-8 pt-8 border-t border-slate-200">
                                                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                                    <h3 className="font-bold text-slate-900 mb-2 text-xl">Enquiry Received</h3>
                                                    <p className="text-slate-600 mb-6">
                                                    We'll contact you within 24 hours with course details and payment information.
                                                    </p>
                                                    <Button
                                                    onClick={() => setEnquirySubmitted(false)}
                                                    variant="outline"
                                                    className="w-full"
                                                    >
                                                    Submit Another Enquiry
                                                    </Button>
                                                    </div>
                                                    )}
                                                    </div>
                                                    </div>
                                                    </div>
                                                    </div>
                    )}
                </main>
            </div>

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
                            <p className="text-sm font-semibold text-slate-800">{selectedDateForBooking.datePatternDescription || formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate)}</p>
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

            {/* Payment Method Dialog - UPDATED BREAKDOWN ORDER */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Confirm Your Booking</DialogTitle>
                        <DialogDescription>
                            {courseCpdHours > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                                    <Award className="w-4 h-4" />
                                    This course is worth {courseCpdHours} CPD {courseCpdHours === 1 ? 'hour' : 'hours'}!
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedDateForBooking && (
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-sm font-semibold text-slate-800">{selectedDateForBooking.datePatternDescription || formatDateRange(selectedDateForBooking.date, selectedDateForBooking.endDate)}</p>
                                <p className="text-xs text-slate-600 mt-1">{selectedDateForBooking.startTime} - {selectedDateForBooking.endTime} • {selectedDateForBooking.location}</p>
                            </div>

                            {/* Number of Participants */}
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-700" />
                                            <span className="text-sm font-bold text-blue-900">Number of Participants</span>
                                        </div>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={numberOfParticipants}
                                        onChange={(e) => setNumberOfParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="mt-2"
                                    />
                                    {breakdown.bulkDiscountPercentage > 0 && (
                                        <p className="text-xs text-green-700 mt-2 font-semibold">
                                            🎉 {breakdown.bulkDiscountPercentage}% bulk discount applied!
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* CPD Hours Slider */}
                            {breakdown.basePrice > 0 && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Coins className="w-4 h-4 text-amber-700" />
                                                <span className="text-sm font-bold text-amber-900">Use Your CPD Hours</span>
                                            </div>
                                            <span className="text-xs text-amber-700">Available: {userCpdHours.toFixed(1)}</span>
                                        </div>
                                        <p className="text-xs text-amber-800 mb-3">
                                            Slide to choose how many CPD hours to apply. Each hour = £20 discount!
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="cpd-slider" className="text-sm font-semibold text-amber-900">
                                                    Hours to use: {cpdHoursToUse.toFixed(1)}
                                                </Label>
                                                <span className="text-sm font-bold text-green-700">
                                                    = £{(cpdHoursToUse * CPD_HOUR_VALUE).toFixed(2)} off
                                                </span>
                                            </div>
                                            <Input
                                                id="cpd-slider"
                                                type="range"
                                                min="0"
                                                max={Math.min(userCpdHours, maxHoursUsable)}
                                                step="0.1"
                                                value={cpdHoursToUse}
                                                onChange={(e) => setCpdHoursToUse(parseFloat(e.target.value))}
                                                className="w-full"
                                                disabled={maxHoursUsable === 0}
                                            />
                                        </div>
                                        {maxHoursUsable > 0 && (
                                            <p className="text-xs text-amber-700 mt-2">
                                                💡 Max {maxHoursUsable.toFixed(1)} hours can be used for this course
                                            </p>
                                        )}
                                        {maxHoursUsable === 0 && (
                                            <p className="text-xs text-slate-600 mt-2">
                                                This course is free, so no CPD hours are needed.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Breakdown - BULK DISCOUNT, CPD, THEN MEMBERSHIP DISCOUNT (FULL MEMBERS ONLY) */}
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Payment Breakdown
                                </h4>
                                <div className="space-y-2 text-sm">
                                    {/* 1. Undiscounted Price */}
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Course Price ({numberOfParticipants} × £{(breakdown.basePrice / numberOfParticipants).toFixed(2)}):</span>
                                        <span className="font-medium">£{breakdown.basePrice.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* 2. Bulk Discount (if applicable) */}
                                    {breakdown.bulkDiscountPercentage > 0 && (
                                        <>
                                            <div className="flex justify-between text-green-700 bg-green-50 -mx-2 px-2 py-1 rounded">
                                                <span className="font-medium">
                                                    <Users className="w-3 h-3 inline mr-1" />
                                                    Bulk Discount ({breakdown.bulkDiscountPercentage}%):
                                                </span>
                                                <span className="font-bold">-£{breakdown.bulkDiscountAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-slate-200 pt-2">
                                                <span className="text-slate-600">After Bulk Discount:</span>
                                                <span className="font-medium">£{(breakdown.basePrice - breakdown.bulkDiscountAmount).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* 3. CPD Hours Discount (if applicable) */}
                                    {breakdown.cpdHoursUsed > 0 && (
                                        <>
                                            <div className="flex justify-between text-amber-700 bg-amber-50 -mx-2 px-2 py-1 rounded">
                                                <span className="font-medium">
                                                    <Coins className="w-3 h-3 inline mr-1" />
                                                    CPD Discount ({breakdown.cpdHoursUsed.toFixed(1)} hour{breakdown.cpdHoursUsed !== 1 ? 's' : ''}):
                                                </span>
                                                <span className="font-bold">-£{breakdown.cpdDiscount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-slate-200 pt-2">
                                                <span className="text-slate-600">After CPD Discount:</span>
                                                <span className="font-medium">£{breakdown.priceAfterCpdDiscount.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* 4. Membership Discount (FULL MEMBERS ONLY) */}
                                    {breakdown.memberDiscountPercentage > 0 && breakdown.priceAfterCpdDiscount > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <span className="font-medium">
                                                {breakdown.memberDiscountPercentage}% Full Member Discount:
                                            </span>
                                            <span className="font-bold">-£{breakdown.memberDiscountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    {/* 5. Cost per participant */}
                                    {numberOfParticipants > 1 && (
                                        <div className="flex justify-between text-blue-700 border-t border-slate-200 pt-2">
                                            <span className="font-medium">Cost per participant:</span>
                                            <span className="font-bold">£{breakdown.pricePerParticipant.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    {/* 6. Final Total */}
                                    <div className="pt-2 border-t-2 border-purple-300 flex justify-between text-lg font-bold">
                                        <span>Estimated Total:</span>
                                        <span className="text-purple-700">£{breakdown.finalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                {breakdown.finalPrice > 0 && (
                                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-xs text-blue-800">
                                            <CreditCard className="w-3 h-3 inline mr-1" />
                                            You'll be redirected to Stripe to complete payment
                                        </p>
                                    </div>
                                )}
                                {breakdown.finalPrice === 0 && (
                                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="text-xs text-green-800 font-semibold">
                                            <CheckCircle className="w-3 h-3 inline mr-1" />
                                            Fully paid with CPD hours - instant confirmation!
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber" className="text-sm">Phone Number *</Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Your phone number"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="bookingNotes" className="text-sm">Additional Notes (Optional)</Label>
                                <Textarea
                                    id="bookingNotes"
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    className="mt-1"
                                    placeholder="Any special requirements or questions?"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={isSubmitting}>
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
                            ) : breakdown.finalPrice === 0 ? (
                               <>
                                   Confirm Booking
                                   <Check className="w-4 h-4 ml-2" />
                               </>
                            ) : (
                               <>
                                   {breakdown.cpdHoursUsed > 0 ? 'Apply Credits & ' : ''}Pay £{breakdown.finalPrice.toFixed(2)}
                                   <ArrowRight className="w-4 h-4 ml-2" />
                               </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Organisation Bulk Booking Modal */}
            {user?.organisationId && (
                <OrgBulkBookingModal
                    open={showOrgBulkBookingModal}
                    onClose={() => {
                        setShowOrgBulkBookingModal(false);
                        setSelectedDateForOrgBooking(null);
                    }}
                    course={course}
                    variantId={variant?.id}
                    variantName={variant?.name}
                    selectedDate={selectedDateForOrgBooking?.datePatternDescription || (selectedDateForOrgBooking ? formatDateRange(selectedDateForOrgBooking.date, selectedDateForOrgBooking.endDate) : '')}
                    selectedTime={selectedDateForOrgBooking ? `${selectedDateForOrgBooking.startTime} - ${selectedDateForOrgBooking.endTime}` : ''}
                    selectedLocation={selectedDateForOrgBooking?.location}
                    user={user}
                />
            )}
        </div>
    );
}
