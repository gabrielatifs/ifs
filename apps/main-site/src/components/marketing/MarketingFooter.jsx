import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Shield, Twitter, Linkedin, Facebook, Youtube, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Logo & About */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link to={createPageUrl("Home")} className="flex items-center mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/36f9296bf_27May-BoardofTrusteesMeeting6.png" 
                  alt="Independent Federation for Safeguarding" 
                  className="h-16 w-auto" // Changed from h-12 to h-16
                />
            </Link>
            <p className="text-sm text-gray-600">
                The UK's professional body for safeguarding practitioners.
            </p>
          </div>

          {/* Membership */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Membership</h3>
            <ul className="space-y-3">
              <li><Link to={createPageUrl("WhyJoinUs")} className="text-base text-gray-600 hover:text-gray-900">Why Join Us</Link></li>
              <li><Link to={createPageUrl("MembershipTiers")} className="text-base text-gray-600 hover:text-gray-900">Membership Tiers</Link></li>
              <li><Link to={createPageUrl("FullMembership")} className="text-base text-gray-600 hover:text-gray-900">Full Membership</Link></li>
              <li><Link to={createPageUrl("AssociateMembership")} className="text-base text-gray-600 hover:text-gray-900">Associate Membership</Link></li>
            </ul>
          </div>

          {/* Professional Development */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Development</h3>
            <ul className="space-y-3">
              <li><Link to={createPageUrl("CPDTraining")} className="text-base text-gray-600 hover:text-gray-900">CPD & Training</Link></li>
              <li><Link to={createPageUrl("SupervisionServices")} className="text-base text-gray-600 hover:text-gray-900">Supervision</Link></li>
              <li><Link to={createPageUrl("Events")} className="text-base text-gray-600 hover:text-gray-900">Events</Link></li>
              <li><Link to={createPageUrl("Job")} className="text-base text-gray-600 hover:text-gray-900">Jobs Board</Link></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">About IfS</h3>
            <ul className="space-y-3">
              <li><Link to={createPageUrl("About")} className="text-base text-gray-600 hover:text-gray-900">About Us</Link></li>
              <li><Link to={createPageUrl("Team")} className="text-base text-gray-600 hover:text-gray-900">Our Team</Link></li>
              <li><Link to={createPageUrl("Governance")} className="text-base text-gray-600 hover:text-gray-900">Governance</Link></li>
              <li><Link to={createPageUrl("ResearchAndAdvocacy")} className="text-base text-gray-600 hover:text-gray-900">Research</Link></li>
              <li><Link to={createPageUrl("Contact")} className="text-base text-gray-600 hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to={createPageUrl("PrivacyPolicy")} className="text-base text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to={createPageUrl("CookiePolicy")} className="text-base text-gray-600 hover:text-gray-900">Cookie Policy</Link></li>
              <li><Link to={createPageUrl("TermsAndConditions")} className="text-base text-gray-600 hover:text-gray-900">Terms and Conditions</Link></li>
              <li><Link to={createPageUrl("Sitemap")} className="text-base text-gray-600 hover:text-gray-900">Sitemap</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-base text-gray-500 order-2 sm:order-1 mt-4 sm:mt-0">
            © 2024 Independent Federation for Safeguarding. All rights reserved.
          </p>
          <div className="flex space-x-6 order-1 sm:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}