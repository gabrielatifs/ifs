import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@ifs/shared/utils';

export default function BenefitCard({ title, description, imageUrl, linkTo, linkText }) {
    const cardContent = (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-black mb-3">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
                {linkTo && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            {linkText || "Learn More"} <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link to={createPageUrl(linkTo)} className="h-full">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}