import React, { useEffect, useState } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Home, ArrowRight, SearchX } from 'lucide-react';
import JobDetailsView from '@/components/jobs/JobDetailsView';

export default function NotFound() {
  // Standard NotFound implementation


  return (
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-40">
        <div className="text-center">
          <div className="flex justify-center items-center mb-8">
              <SearchX className="w-16 h-16 text-purple-300" />
          </div>
          <p className="text-base font-semibold text-purple-600 uppercase tracking-wide">404 error</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            This page does not exist.
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-purple-800 hover:bg-purple-900 text-white font-semibold px-8 py-3 rounded-sm">
              <Link to={createPageUrl('Home')}>
                <Home className="w-5 h-5 mr-2" />
                Return to Homepage
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-purple-800 font-semibold hover:bg-purple-50">
              <Link to={createPageUrl('Contact')}>
                Contact Support <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Suggestion links */}
        <div className="mt-24 border-t border-gray-200 pt-12">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
                Here are some helpful links instead:
            </h2>
            <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <Link to={createPageUrl('Membership')} className="font-medium text-gray-600 hover:text-purple-800 transition-colors">
                    Membership
                </Link>
                <Link to={createPageUrl('Training')} className="font-medium text-gray-600 hover:text-purple-800 transition-colors">
                    Training Courses
                </Link>
                <Link to={createPageUrl('Events')} className="font-medium text-gray-600 hover:text-purple-800 transition-colors">
                    Events & Workshops
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}