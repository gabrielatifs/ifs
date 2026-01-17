import React from 'react';
import { Dialog, DialogContent } from "@ifs/shared/components/ui/dialog";
import { X, User, Award } from 'lucide-react';

const renderBio = (bio) => {
    if (!bio) return null;
    
    // Split the bio into paragraphs based on double newlines
    return bio.split('\n\n').map((paragraph, index) => {
        // Check if the paragraph contains a list
        if (paragraph.includes('\n- ')) {
            const lines = paragraph.split('\n');
            const title = lines[0]; // The line before the list starts
            const items = lines.slice(1).map(item => item.replace(/^- /, '').trim()); // Clean up list items
            
            return (
                <div key={index} className="mb-6">
                    <p className="text-gray-700 leading-relaxed mb-3 font-medium">{title}</p>
                    <ul className="space-y-2 pl-4">
                        {items.map((item, i) => (
                            <li key={i} className="text-gray-600 leading-relaxed flex items-start">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        // Render a regular paragraph
        return <p key={index} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>;
    });
};

export default function BoardMemberModal({ member, onClose }) {
    if (!member) return null;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl p-0 bg-white border-0 shadow-2xl">
                <div className="relative">
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-lg"
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </button>

                    <div className="grid lg:grid-cols-5">
                        {/* Image Section */}
                        <div className="lg:col-span-2 relative">
                            <div className="aspect-[4/5] lg:aspect-auto lg:h-full">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden"></div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="lg:col-span-3 flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-8 border-b border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h2>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-purple-600" />
                                            <p className="text-lg font-semibold text-purple-700">{member.position}</p>
                                        </div>
                                        <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 px-8 py-8 overflow-y-auto max-h-[60vh]">
                                <div className="prose prose-lg max-w-none">
                                    {renderBio(member.background)}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 font-medium">
                                        Independent Federation for Safeguarding
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Board of Trustees
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}