import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@ifs/shared/components/ui/button';

export default function ServiceCard({ content }) {
  if (!content) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {content.imageUrl ? (
        <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
          <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
        </div>
      ) : null}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{content.title}</h3>
        <p className="text-sm text-slate-600 mb-4 flex-1">{content.description}</p>
        {content.linkTo ? (
          <Button asChild className="w-full">
            <Link to={content.linkTo}>{content.linkText || 'Learn more'}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}




