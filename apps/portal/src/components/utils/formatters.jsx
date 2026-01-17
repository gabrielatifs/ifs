import { format } from 'date-fns';

export const formatDateRange = (start, end) => {
    if (!start) return '';
    const startDate = new Date(start);
    if (!end || start === end) {
        return format(startDate, 'd MMMM yyyy');
    }
    const endDate = new Date(end);
    // Check if dates are in the same month and year
    if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
        return `${format(startDate, 'd')} - ${format(endDate, 'd MMMM yyyy')}`;
    }
    // Check if dates are in the same year
    if (startDate.getFullYear() === endDate.getFullYear()) {
        return `${format(startDate, 'd MMMM')} - ${format(endDate, 'd MMMM yyyy')}`;
    }
    // Different years
    return `${format(startDate, 'd MMMM yyyy')} - ${format(endDate, 'd MMMM yyyy')}`;
};