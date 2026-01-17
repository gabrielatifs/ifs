import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Shield, Lock, AlertTriangle, Scale, UserCheck } from 'lucide-react';

const Section = ({ title, icon: Icon, children, numbered }) => (
    <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
            {Icon && (
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-600" />
                </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="prose prose-slate max-w-none">
            {numbered ? (
                <ol className="list-decimal pl-6 space-y-4 text-gray-700">
                    {children}
                </ol>
            ) : (
                children
            )}
        </div>
    </section>
);

export default function TermsAndConditions() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                            <FileText className="w-8 h-8 text-purple-600" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Terms and Conditions of Use
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Please read these terms and conditions carefully, as they affect your legal rights. Your agreement to comply with and be bound by these terms is deemed to occur upon your first use of the Website.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Introduction */}
                <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mb-12 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-900 mb-2">Important Notice</p>
                            <p className="text-amber-800 text-sm mb-2">
                                These terms and conditions apply between you, the User of this Website, and Independent Federation for Safeguarding, the owner and operator of this Website.
                            </p>
                            <p className="text-amber-800 text-sm">
                                <strong>You must be at least 18 years of age to use this Website.</strong> By using the Website and agreeing to these terms and conditions, you represent and warrant that you are at least 18 years of age.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Introduction Text */}
                <Section title="Introduction">
                    <p className="text-gray-700 mb-4">
                        In these terms and conditions, <strong>User</strong> or <strong>Users</strong> means any third party that accesses the Website and is not either (i) employed by Independent Federation for Safeguarding and acting in the course of their employment or (ii) engaged as a consultant or otherwise providing services to Independent Federation for Safeguarding and accessing the Website in connection with the provision of such services.
                    </p>
                    <p className="text-gray-700">
                        If you do not agree to be bound by these terms and conditions, you should stop using the Website immediately.
                    </p>
                </Section>

                {/* Intellectual Property */}
                <Section title="Intellectual Property and Acceptable Use" icon={Shield} numbered>
                    <li>
                        All Content included on the Website, unless uploaded by Users, is the property of Independent Federation for Safeguarding, our affiliates or other relevant third parties. In these terms and conditions, <strong>Content</strong> means any text, graphics, images, audio, video, software, data compilations, page layout, underlying code and software and any other form of information capable of being stored in a computer that appears on or forms part of this Website, including any such content uploaded by Users. By continuing to use the Website you acknowledge that such Content is protected by copyright, trademarks, database rights and other intellectual property rights.
                    </li>
                    <li>
                        You may, for your own personal, non-commercial use only, do the following:
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Retrieve, display and view the Content on a device</li>
                            <li>Download and store the Content in electronic form on a disk (but not on any server or other storage device connected to a network)</li>
                            <li>Print one copy of the Content</li>
                        </ul>
                    </li>
                    <li>
                        You must not otherwise reproduce, modify, copy, distribute or use for commercial purposes any Content without the written permission of Independent Federation for Safeguarding.
                    </li>
                    <li>
                        You acknowledge that you are responsible for any Content you may submit via the Website, including the legality, reliability, appropriateness, originality and copyright of any such Content. You may not upload to, distribute or otherwise publish through the Website any Content that is confidential, proprietary, false, fraudulent, libellous, defamatory, obscene, threatening, invasive of privacy or publicity rights, infringing on intellectual property rights, abusive, illegal or otherwise objectionable.
                    </li>
                    <li>
                        You represent and warrant that you own or otherwise control all the rights to the Content you post; that the Content is accurate; that use of the Content you supply does not violate any provision of these terms and conditions and will not cause injury to any person; and that you will indemnify Independent Federation for Safeguarding for all claims resulting from Content you supply.
                    </li>
                </Section>

                {/* Prohibited Use */}
                <Section title="Prohibited Use" icon={AlertTriangle}>
                    <p className="text-gray-700 mb-4">You may not use the Website for any of the following purposes:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>In any way which causes, or may cause, damage to the Website or interferes with any other person's use or enjoyment of the Website</li>
                        <li>In any way which is harmful, unlawful, illegal, abusive, harassing, threatening or otherwise objectionable or in breach of any applicable law, regulation, governmental order</li>
                        <li>Making, transmitting or storing electronic copies of Content protected by copyright without the permission of the owner</li>
                    </ul>
                </Section>

                {/* Registration */}
                <Section title="Registration" icon={UserCheck} numbered>
                    <li>You must ensure that the details provided by you on registration or at any time are correct and complete.</li>
                    <li>You must inform us immediately of any changes to the information that you provide when registering by updating your personal details to ensure we can communicate with you effectively.</li>
                    <li>We may suspend or cancel your registration with immediate effect for any reasonable purposes or if you breach these terms and conditions.</li>
                    <li>You may cancel your registration at any time by informing us in writing to the address at the end of these terms and conditions. If you do so, you must immediately stop using the Website. Cancellation or suspension of your registration does not affect any statutory rights.</li>
                </Section>

                {/* Password and Security */}
                <Section title="Password and Security" icon={Lock} numbered>
                    <li>When you register on this Website, you will be asked to create a password, which you should keep confidential and not disclose or share with anyone.</li>
                    <li>If we have reason to believe that there is or is likely to be any misuse of the Website or breach of security, we may require you to change your password or suspend your account.</li>
                </Section>

                {/* Links to Other Websites */}
                <Section title="Links to Other Websites">
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                        <li>This Website may contain links to other sites. Unless expressly stated, these sites are not under the control of Independent Federation for Safeguarding or that of our affiliates.</li>
                        <li>We assume no responsibility for the content of such Websites and disclaim liability for any and all forms of loss or damage arising out of the use of them.</li>
                        <li>The inclusion of a link to another site on this Website does not imply any endorsement of the sites themselves or of those in control of them.</li>
                    </ol>
                </Section>

                {/* Privacy Policy */}
                <Section title="Privacy Policy">
                    <p className="text-gray-700">
                        Use of the Website is also governed by our Privacy Policy, which is incorporated into these terms and conditions by this reference. To view the Privacy Policy, please visit:{' '}
                        <Link to={createPageUrl('PrivacyPolicy')} className="text-purple-600 hover:text-purple-700 underline font-semibold">
                            Privacy Policy
                        </Link>
                    </p>
                </Section>

                {/* Availability and Disclaimers */}
                <Section title="Availability of the Website and Disclaimers">
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                        <li>Any online facilities, tools, services or information that Independent Federation for Safeguarding makes available through the Website (the <strong>Service</strong>) is provided "as is" and on an "as available" basis. We give no warranty that the Service will be free of defects and/or faults. To the maximum extent permitted by the law, we provide no warranties (express or implied) of fitness for a particular purpose, accuracy of information, compatibility and satisfactory quality.</li>
                        <li>Whilst Independent Federation for Safeguarding uses reasonable endeavours to ensure that the Website is secure and free of errors, viruses and other malware, we give no warranty or guaranty in that regard and all Users take responsibility for their own security, that of their personal details and their computers.</li>
                        <li>Independent Federation for Safeguarding accepts no liability for any disruption or non-availability of the Website.</li>
                        <li>Independent Federation for Safeguarding reserves the right to alter, suspend or discontinue any part (or the whole) of the Website including, but not limited to, any products and/or services available. These terms and conditions shall continue to apply to any modified version of the Website unless it is expressly stated otherwise.</li>
                    </ol>
                </Section>

                {/* Limitation of Liability */}
                <Section title="Limitation of Liability" icon={Scale}>
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                        <li>
                            <strong>Nothing in these terms and conditions will:</strong>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Limit or exclude our or your liability for death or personal injury resulting from our or your negligence, as applicable</li>
                                <li>Limit or exclude our or your liability for fraud or fraudulent misrepresentation</li>
                                <li>Limit or exclude any of our or your liabilities in any way that is not permitted under applicable law</li>
                            </ul>
                        </li>
                        <li>We will not be liable to you in respect of any losses arising out of events beyond our reasonable control.</li>
                        <li>
                            To the maximum extent permitted by law, Independent Federation for Safeguarding accepts no liability for any of the following:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Any business losses, such as loss of profits, income, revenue, anticipated savings, business, contracts, goodwill or commercial opportunities</li>
                                <li>Loss or corruption of any data, database or software</li>
                                <li>Any special, indirect or consequential loss or damage</li>
                            </ul>
                        </li>
                    </ol>
                </Section>

                {/* General */}
                <Section title="General">
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                        <li>You may not transfer any of your rights under these terms and conditions to any other person. We may transfer our rights under these terms and conditions where we reasonably believe your rights will not be affected.</li>
                        <li>These terms and conditions may be varied by us from time to time. Such revised terms will apply to the Website from the date of publication. Users should check the terms and conditions regularly to ensure familiarity with the then current version.</li>
                        <li>These terms and conditions, together with the Privacy Policy, contain the whole agreement between the parties relating to its subject matter and supersede all prior discussions, arrangements or agreements that might have taken place in relation to the terms and conditions.</li>
                        <li>The Contracts (Rights of Third Parties) Act 1999 shall not apply to these terms and conditions and no third party will have any right to enforce or rely on any provision of these terms and conditions.</li>
                        <li>If any court or competent authority finds that any provision of these terms and conditions (or part of any provision) is invalid, illegal or unenforceable, that provision or part-provision will, to the extent required, be deemed to be deleted, and the validity and enforceability of the other provisions of these terms and conditions will not be affected.</li>
                        <li>Unless otherwise agreed, no delay, act or omission by a party in exercising any right or remedy will be deemed a waiver of that, or any other, right or remedy.</li>
                        <li><strong>This Agreement shall be governed by and interpreted according to the law of England and Wales and all disputes arising under the Agreement (including non-contractual disputes or claims) shall be subject to the exclusive jurisdiction of the English and Welsh courts.</strong></li>
                    </ol>
                </Section>

                {/* Company Details */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Independent Federation for Safeguarding Details</h2>
                    <div className="space-y-3 text-gray-700">
                        <p>
                            Independent Federation for Safeguarding is a company incorporated in England and Wales with registered number <strong>16491485</strong>.
                        </p>
                        <p>
                            <strong>Registered Address:</strong> 6-8 Revenge Road, Suite 2076, Kent, ME5 8UD
                        </p>
                        <p>
                            <strong>Website:</strong>{' '}
                            <a href="https://ifs-safeguarding.co.uk/" className="text-purple-600 hover:text-purple-700 underline">
                                https://ifs-safeguarding.co.uk/
                            </a>
                        </p>
                        <p>
                            <strong>Email:</strong>{' '}
                            <a href="mailto:info@ifs-safeguarding.co.uk" className="text-purple-600 hover:text-purple-700 underline">
                                info@ifs-safeguarding.co.uk
                            </a>
                        </p>
                    </div>
                </div>

                {/* Attribution */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>
                        These terms and conditions were created using a document from{' '}
                        <a href="https://www.rocketlawyer.com/gb/en" target="_blank" rel="noopener noreferrer" className="underline">
                            Rocket Lawyer
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}