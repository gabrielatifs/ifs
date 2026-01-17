import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Award, Calendar, ArrowRight, ShieldCheck, FileText, Monitor, Users, Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import { CourseDate } from '@/api/entities';
import { Course } from '@/api/entities';

export default function TrainingMegaMenu({ arrowPosition }) {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [allDates, allCourses] = await Promise.all([
          CourseDate.filter({ status: 'Available' }, 'date', 10),
          Course.list()
        ]);

        const upcoming = allDates.filter(date => new Date(date.date) >= today);
        const coursesMap = {};
        allCourses.forEach(c => coursesMap[c.id] = c);
        
        const sessionsWithCourses = upcoming
          .map(date => ({
            ...date,
            course: coursesMap[date.courseId]
          }))
          .filter(d => d.course)
          .slice(0, 5);
        
        setUpcomingSessions(sessionsWithCourses);
      } catch (error) {
        console.error("Failed to fetch upcoming sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, []);
  return (
    <div 
      className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border-t border-gray-200 animate-in fade-in-5 slide-in-from-top-2 duration-300"
      style={{
        '--tw-enter-opacity': '0',
        '--tw-enter-translate-y': '-0.5rem',
      }}
    >
      {/* Arrow */}
      <div 
        className="absolute top-0 w-4 h-4 bg-white transform rotate-45"
        style={{
          left: `calc(${arrowPosition}px - 0.5rem)`,
          transform: 'translateY(-50%) rotate(45deg)',
        }}
      ></div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Featured Section */}
          <div className="relative bg-slate-50 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop')"}}
            ></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Professional Development</h3>
              <p className="text-sm text-gray-600 mb-4">
                Advance your safeguarding expertise with our comprehensive, CPD-accredited training portfolio.
              </p>
            </div>
            <div className="relative z-10 space-y-3">
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to={createPageUrl('Training')}>
                    Browse All Courses <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-gray-300 bg-white/80 hover:bg-white">
                  <Link to={createPageUrl('Contact')}>
                    Bespoke Training Enquiries
                  </Link>
                </Button>
            </div>
          </div>

          {/* Column 2: Course Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Explore The Catalogue</h4>
            
            <Link to={createPageUrl('IntroductoryCourses')} className="block p-4 rounded-lg hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group">
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">Introductory Courses</h5>
                </div>
                <p className="text-sm text-gray-600">Foundation courses for all staff with safeguarding responsibilities.</p>
            </Link>

            <div className="border-t border-gray-200"></div>

            <Link to={createPageUrl('AdvancedCourses')} className="block p-4 rounded-lg hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 transition-all group">
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-gray-900 group-hover:text-purple-800 transition-colors">Advanced & Specialist</h5>
                </div>
                <p className="text-sm text-gray-600">For experienced DSLs, leaders, and those in specialist roles.</p>
            </Link>
            
            <div className="border-t border-gray-200"></div>

            <Link to={createPageUrl('RefresherCourses')} className="block p-4 rounded-lg hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 transition-all group">
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-gray-900 group-hover:text-orange-800 transition-colors">Annual Refresher</h5>
                </div>
                <p className="text-sm text-gray-600">Stay up-to-date with the latest statutory guidance and best practice.</p>
            </Link>
          </div>
          
          {/* Column 3: Upcoming Sessions */}
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">Upcoming Sessions</h4>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-gray-400 text-sm">Loading sessions...</div>
              </div>
            ) : upcomingSessions.length > 0 ? (
              upcomingSessions.map((session, index) => {
                const Icon = index === 0 ? GraduationCap : index === 1 ? BookOpen : index === 2 ? Users : index === 3 ? Monitor : RefreshCw;
                return (
                  <Link 
                    key={`${session.courseId}-${session.date}`} 
                    to={createPageUrl('TrainingCourseDetails') + '?id=' + session.courseId} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-gray-900">{session.course.title}</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {session.location}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No upcoming sessions scheduled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}