import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { generateJobSlug, generateJobPath } from '@/components/utils/jobUtils';
import { Button } from '@ifs/shared/components/ui/button';
import { MapPin, Briefcase, Clock, ArrowRight, Building, DollarSign, BarChart, CalendarDays } from 'lucide-react';
import { Badge } from '@ifs/shared/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function JobCard({ job, isPublic = false }) {
  
  const getSalaryText = () => {
    if (job.salaryDisplayText) return job.salaryDisplayText;
    if (job.salaryMin && job.salaryMax) return `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `From £${job.salaryMin.toLocaleString()}`;
    if (job.salaryMax) return `Up to £${job.salaryMax.toLocaleString()}`;
    return 'Not Disclosed';
  };

  const postedAt = job.created_date ? `${formatDistanceToNow(new Date(job.created_date))} ago` : null;

  const stripHtml = (html) => {
      if (!html) return '';
      try {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          return doc.body.textContent || "";
      } catch (e) {
          return html.replace(/<[^>]*>?/gm, '');
      }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 flex flex-col group">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {job.companyLogoUrl ? (
              <img src={job.companyLogoUrl} alt={`${job.companyName} logo`} className="w-10 h-10 object-contain" />
            ) : (
              <Building className="w-7 h-7 text-gray-400" />
            )}
          </div>
          
          {/* Title and Company */}
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              <Link to={isPublic ? generateJobPath(job) : `${createPageUrl('Job/view')}?id=${job.id}`} className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded">
                {job.title}
              </Link>
            </h3>
            <p className="text-sm font-medium text-gray-500">{job.companyName}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>{job.contractType}</span>
          </div>
           <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{job.workingHours}</span>
          </div>
          {postedAt && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>Posted {postedAt}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {stripHtml(job.description)}
        </p>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-t border-gray-100 rounded-b-lg mt-auto">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-medium border-green-300 bg-green-50 text-green-800">
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              {getSalaryText()}
            </Badge>
            <Badge variant="outline" className="font-medium border-blue-300 bg-blue-50 text-blue-800">
               <BarChart className="w-3.5 h-3.5 mr-1.5" />
              {job.experienceLevel}
            </Badge>
        </div>

        {/* View Button */}
        <Button
          asChild
          size="sm"
          className="bg-gray-900 hover:bg-gray-700 text-white shadow-sm hover:shadow-md transition-all"
        >
          <Link to={isPublic ? generateJobPath(job) : `${createPageUrl('Job/view')}?id=${job.id}`}>
            View Details <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </article>
  );
}