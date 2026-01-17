
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DigitalCredential } from '@/api/entities';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Award, Calendar, User, Shield, ExternalLink, Verified, AlertCircle, Printer, Share2, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function VerifyCredential() {
    const location = useLocation();
    const [searchCode, setSearchCode] = useState('');
    const [credential, setCredential] = useState(null);
    const [otherCredentials, setOtherCredentials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (code) {
            setSearchCode(code);
            verifyCredential(code);
        } else {
            setInitialLoad(false);
        }
    }, [location]);

    const verifyCredential = async (code) => {
        if (!code || !code.trim()) {
            setError('Please enter a verification code');
            return;
        }

        setLoading(true);
        setError(null);
        setInitialLoad(false);

        try {
            const credentials = await DigitalCredential.filter({ verificationCode: code.trim() });
            
            if (!credentials || credentials.length === 0) {
                setError('Invalid verification code. Please check and try again.');
                setCredential(null);
                setOtherCredentials([]);
            } else {
                const foundCredential = credentials[0];
                setCredential(foundCredential);
                
                // Fetch other credentials from the same user
                const allUserCredentials = await DigitalCredential.filter({ 
                    userId: foundCredential.userId,
                    status: 'active'
                });
                
                // Filter out the current credential and show others
                const others = allUserCredentials.filter(c => c.id !== foundCredential.id);
                setOtherCredentials(others);
            }
        } catch (err) {
            console.error('Error verifying credential:', err);
            setError('Failed to verify credential. Please try again.');
            setCredential(null);
            setOtherCredentials([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        verifyCredential(searchCode);
    };

    const handleViewOtherCredential = (code) => {
        setSearchCode(code);
        verifyCredential(code);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderSearchSection = () => (
        <div className="max-w-2xl mx-auto mb-12">
            <Card className="border-0 shadow-2xl bg-white">
                <CardContent className="pt-8 pb-8">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-10 h-10 text-purple-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Credential</h1>
                        <p className="text-gray-600">Enter a verification code to confirm credential authenticity</p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Enter verification code (e.g., IFS-1234567890-ABC123)"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                className="text-center text-lg h-14"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5 mr-2" />
                                    Verify Credential
                                </>
                            )}
                        </Button>
                    </form>

                    {error && !loading && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderCredentialCertificate = (cred, isMainCredential = true) => {
        const isExpired = cred.expiryDate && new Date(cred.expiryDate) < new Date();
        const isRevoked = cred.status === 'revoked';
        const isValid = cred.status === 'active' && !isExpired && !isRevoked;

        // Normalize "Workshop Attendance" to "Masterclass Attendance" for display
        const displayCredentialType = cred.credentialType === 'Workshop Attendance' ? 'Masterclass Attendance' : cred.credentialType;
        
        // Update description to use "masterclass" instead of "workshop"
        const displayDescription = cred.description.replace(/workshop/gi, 'masterclass');

        return (
            <div key={cred.id} className={isMainCredential ? '' : 'mb-8'}>
                {isMainCredential && (
                    <div className={`mb-8 p-6 rounded-xl shadow-lg text-center ${
                        isValid ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        isRevoked ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                        <div className="flex items-center justify-center gap-3 mb-2">
                            {isValid ? (
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            ) : (
                                <AlertCircle className="w-8 h-8 text-white" />
                            )}
                            <h2 className="text-2xl font-bold text-white">
                                {isValid ? 'Verified Credential' :
                                 isRevoked ? 'Credential Revoked' :
                                 'Credential Expired'}
                            </h2>
                        </div>
                        <p className="text-white/90 text-lg">
                            {isValid ? 'This is a valid and verified professional credential' :
                             isRevoked ? 'This credential has been revoked and is no longer valid' :
                             'This credential has expired'}
                        </p>
                    </div>
                )}

                <Card className="overflow-hidden border-2 border-slate-300 shadow-2xl bg-white">
                    {/* Certificate-Style Header */}
                    <div className="relative bg-gradient-to-br from-slate-50 to-white border-b-4 border-purple-600 p-8 md:p-12">
                        {/* Decorative Corner Elements */}
                        <div className="absolute top-0 left-0 w-24 md:w-32 h-24 md:h-32 border-t-4 border-l-4 border-purple-300 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 border-t-4 border-r-4 border-purple-300 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 border-b-4 border-l-4 border-purple-300 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-24 md:w-32 h-24 md:h-32 border-b-4 border-r-4 border-purple-300 rounded-br-xl"></div>
                        
                        <div className="relative z-10 text-center">
                            {/* IfS Logo/Seal */}
                            <div className="flex justify-center mb-6 md:mb-8">
                                <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-purple-700 to-purple-900 rounded-full p-1.5 shadow-2xl">
                                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-purple-200">
                                        <Award className="w-12 md:w-16 h-12 md:h-16 text-purple-700" />
                                    </div>
                                </div>
                            </div>

                            {/* Organization Name */}
                            <div className="mb-4 md:mb-6">
                                <p className="text-sm md:text-base font-semibold text-slate-500 uppercase tracking-widest mb-2">Independent Federation for Safeguarding</p>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-px w-12 md:w-16 bg-purple-300"></div>
                                    <Verified className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
                                    <div className="h-px w-12 md:w-16 bg-purple-300"></div>
                                </div>
                            </div>

                            {/* Credential Type Badge */}
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300 mb-6 md:mb-8 px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-semibold">
                                {displayCredentialType}
                            </Badge>

                            {/* Certificate of Achievement */}
                            <div className="mb-4 md:mb-6">
                                <p className="text-lg md:text-xl text-slate-600 mb-3 md:mb-4 font-serif italic">Certificate of Achievement</p>
                                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight px-4">
                                    {cred.title}
                                </h1>
                            </div>

                            {/* Recipient Name */}
                            <div className="mb-6 md:mb-8">
                                <p className="text-base md:text-lg text-slate-600 mb-2">This credential is awarded to</p>
                                <p className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-2">
                                    {cred.userName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Credential Body */}
                    <CardContent className="p-6 md:p-12">
                        {/* Description */}
                        <div className="text-center mb-8 md:mb-12">
                            <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto">
                                {displayDescription}
                            </p>
                        </div>

                        {/* Credential Details Grid */}
                        <div className="grid md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 pb-8 md:pb-12 border-b-2 border-slate-200">
                            <div className="text-center p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Issue Date</p>
                                <p className="text-lg md:text-xl font-bold text-slate-900">
                                    {format(new Date(cred.issuedDate), 'd MMMM yyyy')}
                                </p>
                            </div>
                            
                            {cred.expiryDate && (
                                <div className={`text-center p-4 md:p-6 rounded-xl border ${
                                    isExpired ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Expiry Date</p>
                                    <p className={`text-lg md:text-xl font-bold ${isExpired ? 'text-orange-600' : 'text-slate-900'}`}>
                                        {format(new Date(cred.expiryDate), 'd MMMM yyyy')}
                                    </p>
                                </div>
                            )}
                            
                            <div className="text-center p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Credential ID</p>
                                <p className="text-xs md:text-sm font-mono font-bold text-slate-900 break-all">
                                    {cred.verificationCode}
                                </p>
                            </div>
                        </div>

                        {/* Additional Details */}
                        {cred.metadata && Object.keys(cred.metadata).length > 0 && (
                            <div className="mb-8 md:mb-12">
                                <h3 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-wider text-center mb-6 md:mb-8 border-b-2 border-purple-300 pb-4">
                                    Additional Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                    {cred.metadata.courseTitle && (
                                        <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Course Title
                                            </p>
                                            <p className="text-base md:text-lg font-semibold text-slate-900">
                                                {cred.metadata.courseTitle}
                                            </p>
                                        </div>
                                    )}
                                    {/* Handle both old workshopTitle and new masterclassTitle */}
                                    {(cred.metadata.masterclassTitle || cred.metadata.workshopTitle) && (
                                        <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Masterclass Title
                                            </p>
                                            <p className="text-base md:text-lg font-semibold text-slate-900">
                                                {cred.metadata.masterclassTitle || cred.metadata.workshopTitle}
                                            </p>
                                        </div>
                                    )}
                                    {cred.metadata.completionDate && (
                                        <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Completion Date
                                            </p>
                                            <p className="text-base md:text-lg font-semibold text-slate-900">
                                                {format(new Date(cred.metadata.completionDate), 'd MMMM yyyy')}
                                            </p>
                                        </div>
                                    )}
                                    {cred.metadata.hours && (
                                        <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                CPD Hours
                                            </p>
                                            <p className="text-base md:text-lg font-semibold text-slate-900">
                                                {cred.metadata.hours} hours
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Official Verification Footer */}
                        {isMainCredential && (
                            <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl p-6 md:p-8 border-2 border-purple-200">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <Shield className="w-6 md:w-8 h-6 md:h-8 text-purple-600" />
                                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Official Verification</h3>
                                </div>
                                <p className="text-center text-sm md:text-base text-slate-700 leading-relaxed mb-4">
                                    This credential has been verified and issued by the Independent Federation for Safeguarding.
                                    All credentials can be independently verified using their unique verification code.
                                </p>
                                <div className="text-center">
                                    <p className="text-xs md:text-sm font-semibold text-slate-600 mb-1">Verified on:</p>
                                    <p className="text-sm md:text-base font-bold text-purple-700">
                                        {format(new Date(), 'd MMMM yyyy \'at\' HH:mm')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (initialLoad && loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 font-medium">Verifying credential...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 md:py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Search Section - Always Show */}
                {renderSearchSection()}

                {/* Main Credential */}
                {credential && renderCredentialCertificate(credential, true)}

                {/* Other Credentials from Same User */}
                {credential && otherCredentials.length > 0 && (
                    <div className="mt-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                                Other Credentials for {credential.userName}
                            </h2>
                            <p className="text-slate-600 text-base md:text-lg">
                                This professional has earned {otherCredentials.length} additional credential{otherCredentials.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherCredentials.map((otherCred) => (
                                <Card key={otherCred.id} className="hover:shadow-xl transition-shadow border-2 border-slate-200">
                                    <CardContent className="p-6">
                                        <Badge className="bg-purple-100 text-purple-800 border-purple-300 mb-4">
                                            {otherCred.credentialType === 'Workshop Attendance' ? 'Masterclass Attendance' : otherCred.credentialType}
                                        </Badge>
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                                            {otherCred.title}
                                        </h3>
                                        <div className="space-y-2 mb-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Issued: {format(new Date(otherCred.issuedDate), 'd MMM yyyy')}</span>
                                            </div>
                                            {otherCred.status === 'active' && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="font-semibold">Active</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleViewOtherCredential(otherCred.verificationCode)}
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View Certificate
                                        </Button>
                                    </CardContent>
                                器</Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Print & Share Instructions */}
                {credential && (
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">Print or Share This Credential</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
                            <div className="flex items-start gap-3">
                                <Printer className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-slate-900 mb-1">Print This Page</p>
                                    <p>Use your browser's print function (Ctrl/Cmd + P) to create a PDF or print a physical copy.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Share2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-slate-900 mb-1">Share Verification Link</p>
                                    <p>Copy this page's URL to share with employers or add to your professional profile.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
