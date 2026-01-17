import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Button } from '@ifs/shared/components/ui/button';
import { Clock, MapPin, Calendar, Coins, ArrowRight } from 'lucide-react';
import { useUser } from '@ifs/shared/components/providers/UserProvider';

export default function CourseCard({ course, showEnquireButton = false }) {
    const { user } = useUser();
    const isFullMember = user?.membershipType === 'Full';
    const isAssociateMember = user?.membershipType === 'Associate';
    const canUseCredits = (isFullMember || isAssociateMember) && (user?.creditBalance || 0) > 0;
    
    // Determine price to show based on membership
    let displayPrice = course.price;
    if (isFullMember && course.priceFullMember) {
        displayPrice = course.priceFullMember;
    }

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
            {course.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                    <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            
            <CardHeader className="flex-grow">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{course.level}</Badge>
                    {course.creditCost && course.creditCost > 0 && canUseCredits && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {course.creditCost}
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">{course.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-2 text-sm text-slate-600">
                {course.duration && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{course.duration}</span>
                    </div>
                )}
                {course.format && course.format.length > 0 && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{course.format.join(', ')}</span>
                    </div>
                )}
                <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Price:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">
                                £{displayPrice}
                            </span>
                            {canUseCredits && course.creditCost && (
                                <span className="text-xs text-slate-500">
                                    or {course.creditCost} credits
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            
            <CardFooter>
                <Button asChild className="w-full" variant={showEnquireButton ? "outline" : "default"}>
                    <Link to={createPageUrl(`CourseDetails?courseId=${course.id}`)}>
                        {showEnquireButton ? 'View Details' : 'Learn More'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}