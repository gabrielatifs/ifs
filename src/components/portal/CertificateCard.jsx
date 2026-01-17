import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CertificateCard = ({ certificate }) => {
    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base">Membership Certificate</CardTitle>
            </CardHeader>
            <CardContent>
                {certificate ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                            <Award className="w-7 h-7 text-purple-700" />
                        </div>
                        <h3 className="font-semibold text-slate-800">{certificate.type} Membership</h3>
                        <p className="text-sm text-slate-500 mb-4">Issued: {format(new Date(certificate.issuedDate), 'dd MMM, yyyy')}</p>
                        <Button asChild className="w-full">
                            <a href={certificate.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </a>
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                             <Award className="w-7 h-7 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-700 mb-1">No Certificate Available</h3>
                        <p className="text-sm text-slate-500 mb-4">Your official certificate will be shown here once generated.</p>
                        <Button asChild size="sm" variant="outline">
                            <Link to={createPageUrl('MyCertificates')}>
                                View All Certificates <ArrowRight className="w-3 h-3 ml-2" />
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CertificateCard;