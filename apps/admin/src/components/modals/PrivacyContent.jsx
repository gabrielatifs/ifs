import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { AlertCircle } from 'lucide-react';

const Section = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="prose prose-slate max-w-none text-sm">
            {children}
        </div>
    </section>
);

const DefinitionRow = ({ term, definition }) => (
    <tr className="border-b border-gray-200">
        <td className="py-2 pr-3 font-semibold text-gray-900 align-top text-xs">{term}</td>
        <td className="py-2 text-gray-700 text-xs">{definition}</td>
    </tr>
);

const CookieTable = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg text-xs">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Description</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);

const CookieRow = ({ description, purpose }) => (
    <tr className="border-b border-gray-200">
        <td className="px-3 py-2 text-gray-900 text-xs">{description}</td>
        <td className="px-3 py-2 text-gray-700 text-xs">{purpose}</td>
    </tr>
);

export default function PrivacyContent() {
    return (
        <div className="prose prose-slate max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-blue-900 text-sm mb-2">Please read this Privacy Policy carefully</p>
                        <p className="text-blue-800 text-xs">
                            This Privacy Policy applies between you, the User of this Website, and Independent Federation for Safeguarding, the owner and provider of this Website. This Privacy Policy should be read alongside, and in addition to, our Terms and Conditions.
                        </p>
                    </div>
                </div>
            </div>

            <Section title="Definitions and Interpretation">
                <p className="text-gray-700 text-sm mb-4">In this Privacy Policy, the following definitions are used:</p>
                
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <tbody>
                            <DefinitionRow 
                                term="Data"
                                definition="Collectively all information that you submit to Independent Federation for Safeguarding via the Website. This definition incorporates, where applicable, the definitions provided in the Data Protection Laws."
                            />
                            <DefinitionRow 
                                term="Cookies"
                                definition="A small text file placed on your computer by this Website when you visit certain parts of the Website and/or when you use certain features of the Website."
                            />
                            <DefinitionRow 
                                term="Data Protection Laws"
                                definition="Any applicable law relating to the processing of personal Data, including but not limited to the GDPR, and any national implementing and supplementary laws, regulations and secondary legislation."
                            />
                            <DefinitionRow 
                                term="GDPR"
                                definition="The UK General Data Protection Regulation."
                            />
                            <DefinitionRow 
                                term="Independent Federation for Safeguarding, we or us"
                                definition="Independent Federation for Safeguarding of 6-8 Revenge Road, Chatham, Kent, ME5 8UD."
                            />
                            <DefinitionRow 
                                term="UK and EU Cookie Law"
                                definition="The Privacy and Electronic Communications (EC Directive) Regulations 2003 as amended by the Privacy and Electronic Communications (EC Directive) (Amendment) Regulations 2011 & 2018."
                            />
                            <DefinitionRow 
                                term="User or you"
                                definition="Any third party that accesses the Website and is not either (i) employed by Independent Federation for Safeguarding and acting in the course of their employment or (ii) engaged as a consultant or otherwise providing services to Independent Federation for Safeguarding."
                            />
                            <DefinitionRow 
                                term="Website"
                                definition="The website that you are currently using, https://ifs-safeguarding.co.uk/, and any sub-domains of this site unless expressly excluded by their own terms and conditions."
                            />
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title="Scope of this Privacy Policy">
                <p className="text-gray-700 text-sm mb-3">
                    This Privacy Policy applies only to the actions of Independent Federation for Safeguarding and Users with respect to this Website. It does not extend to any websites that can be accessed from this Website including, but not limited to, any links we may provide to social media websites.
                </p>
                <p className="text-gray-700 text-sm">
                    For purposes of the applicable Data Protection Laws, Independent Federation for Safeguarding is the "data controller". This means that Independent Federation for Safeguarding determines the purposes for which, and the manner in which, your Data is processed.
                </p>
            </Section>

            <Section title="Data Collected">
                <p className="text-gray-700 text-sm mb-3">We may collect the following Data, which includes personal Data, from you:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li>Name</li>
                    <li>Date of birth</li>
                    <li>Gender</li>
                    <li>Job title and profession</li>
                    <li>Contact information such as email addresses and telephone numbers</li>
                    <li>Demographic information such as postcode, preferences and interests</li>
                    <li>Financial information such as credit/debit card numbers</li>
                    <li>IP address (automatically collected)</li>
                    <li>Web browser type and version (automatically collected)</li>
                    <li>Operating system (automatically collected)</li>
                    <li>A list of URLs starting with a referring site, your activity on this Website, and the site you exit to (automatically collected)</li>
                    <li>Session events</li>
                </ul>
            </Section>

            <Section title="How We Collect Data">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Data That is Given to Us by You</h3>
                <p className="text-gray-700 text-sm mb-3">Independent Federation for Safeguarding will collect your Data in a number of ways, for example:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-5">
                    <li>When you contact us through the Website, by telephone, post, e-mail or through any other means</li>
                    <li>When you register with us and set up an account to receive our products/services</li>
                    <li>When you complete surveys that we use for research purposes (although you are not obliged to respond to them)</li>
                    <li>When you enter a competition or promotion through a social media channel</li>
                    <li>When you make payments to us, through this Website or otherwise</li>
                    <li>When you elect to receive marketing communications from us</li>
                    <li>When you use our services</li>
                </ul>

                <h3 className="text-base font-semibold text-gray-900 mb-3">Data That is Collected Automatically</h3>
                <p className="text-gray-700 text-sm mb-3">To the extent that you access the Website, we will collect your Data automatically, for example:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li>We automatically collect some information about your visit to the Website. This information helps us to make improvements to Website content and navigation, and includes your IP address, the date, times and frequency with which you access the Website and the way you use and interact with its content.</li>
                    <li>We will collect your Data automatically via cookies, in line with the cookie settings on your browser. For more information about cookies, see the section below.</li>
                </ul>
            </Section>

            <Section title="Our Use of Data">
                <p className="text-gray-700 text-sm mb-3">Any or all of the above Data may be required by us from time to time in order to provide you with the best possible service and experience when using our Website. Specifically, Data may be used by us for the following reasons:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
                    <li>Internal record keeping</li>
                    <li>Improvement of our products/services</li>
                    <li>Transmission by email of marketing materials that may be of interest to you</li>
                    <li>Contact for market research purposes which may be done using email, telephone, fax or mail</li>
                </ul>

                <p className="text-gray-700 text-sm mb-3">
                    We may use your Data for the above purposes if we deem it necessary to do so for our legitimate interests. If you are not satisfied with this, you have the right to object in certain circumstances (see the section headed "Your rights" below).
                </p>

                <h3 className="text-base font-semibold text-gray-900 mb-3">Direct Marketing Consent</h3>
                <p className="text-gray-700 text-sm mb-3">For the delivery of direct marketing to you via e-mail, we'll need your consent:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li><strong>Soft opt-in consent:</strong> This applies when you have previously engaged with us (for example, you contact us to ask for more details about a particular product/service). Under "soft opt-in" consent, we will take your consent as given unless you opt-out.</li>
                    <li><strong>Explicit consent:</strong> For other types of e-marketing, we require your explicit consent by taking positive and affirmative action, such as checking a tick box.</li>
                    <li>If you are not satisfied with our approach to marketing, you have the right to withdraw consent at any time.</li>
                </ul>
            </Section>

            <Section title="Who We Share Data With">
                <p className="text-gray-700 text-sm mb-3">We may share your Data with the following groups of people for the following reasons:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li><strong>Our employees, agents and/or professional advisors</strong> - to improve the service provided to users</li>
                    <li><strong>Third party service providers</strong> - to perform data analytics and inform service delivery improvements</li>
                    <li><strong>Third party payment providers (Stripe)</strong> - to enable seamless and immediate upgrades</li>
                    <li><strong>Relevant authorities</strong> - to fulfil our legal responsibilities</li>
                </ul>
            </Section>

            <Section title="Keeping Data Secure">
                <p className="text-gray-700 text-sm mb-3">We will use technical and organisational measures to safeguard your Data, for example:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
                    <li>Access to your account is controlled by a password and a user name that is unique to you</li>
                    <li>We store your Data on secure servers</li>
                    <li>Payment details are encrypted using SSL technology (typically you will see a lock icon or green address bar in your browser when we use this technology)</li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-3 rounded-r mb-4">
                    <p className="text-yellow-900 text-xs">
                        <strong>Important:</strong> If you suspect any misuse or loss or unauthorised access to your Data, please let us know immediately by contacting us at{' '}
                        <a href="mailto:info@ifs-safeguarding.co.uk" className="font-semibold underline">
                            info@ifs-safeguarding.co.uk
                        </a>
                    </p>
                </div>

                <p className="text-gray-700 text-sm">
                    For detailed information on how to protect your information and your computers and devices against fraud, identity theft, viruses and many other online problems, please visit{' '}
                    <a href="https://www.getsafeonline.org" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                        www.getsafeonline.org
                    </a>
                    . Get Safe Online is supported by HM Government and leading businesses.
                </p>
            </Section>

            <Section title="Data Retention">
                <p className="text-gray-700 text-sm mb-3">
                    Unless a longer retention period is required or permitted by law, we will only hold your Data on our systems for the period necessary to fulfil the purposes outlined in this Privacy Policy or until you request that the Data be deleted.
                </p>
                <p className="text-gray-700 text-sm">
                    Even if we delete your Data, it may persist on backup or archival media for legal, tax or regulatory purposes.
                </p>
            </Section>

            <Section title="Your Rights">
                <p className="text-gray-700 text-sm mb-3">You have the following rights in relation to your Data:</p>
                
                <div className="space-y-3 mb-4">
                    <div className="border-l-4 border-purple-600 pl-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Right to access</h4>
                        <p className="text-gray-700 text-xs">
                            The right to request copies of the information we hold about you at any time, or that we modify, update or delete such information. If we provide you with access to the information we hold about you, we will not charge you for this, unless your request is "manifestly unfounded or excessive."
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Right to correct</h4>
                        <p className="text-gray-700 text-xs">
                            The right to have your Data rectified if it is inaccurate or incomplete.
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Right to erase</h4>
                        <p className="text-gray-700 text-xs">
                            The right to request that we delete or remove your Data from our systems.
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Right to restrict</h4>
                        <p className="text-gray-700 text-xs">
                            The right to "block" us from using your Data or limit the way in which we can use it.
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Right to data portability</h4>
                        <p className="text-gray-700 text-xs">
                            The right to request that we move, copy or transfer your Data.
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Right to object</h4>
                        <p className="text-gray-700 text-xs">
                            The right to object to our use of your Data including where we use it for our legitimate interests.
                        </p>
                    </div>
                </div>

                <p className="text-gray-700 text-sm mb-3">
                    To make enquiries, exercise any of your rights set out above, or withdraw your consent to the processing of your Data, please contact us at{' '}
                    <a href="mailto:info@ifs-safeguarding.co.uk" className="text-purple-600 hover:text-purple-700 underline font-semibold">
                        info@ifs-safeguarding.co.uk
                    </a>
                </p>

                <p className="text-gray-700 text-sm mb-3">
                    If you are not satisfied with the way a complaint you make in relation to your Data is handled by us, you may be able to refer your complaint to the relevant data protection authority. For the UK, this is the Information Commissioner's Office (ICO). The ICO's contact details can be found on their website at{' '}
                    <a href="https://ico.org.uk/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                        https://ico.org.uk/
                    </a>
                </p>

                <p className="text-gray-700 text-sm">
                    It is important that the Data we hold about you is accurate and current. Please keep us informed if your Data changes during the period for which we hold it.
                </p>
            </Section>

            <Section title="Cookies">
                <p className="text-gray-700 text-sm mb-4">
                    This Website may place and access certain Cookies on your computer. Independent Federation for Safeguarding uses Cookies to improve your experience of using the Website and to improve our range of products and services. All Cookies used by this Website are used in accordance with current UK and EU Cookie Law.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Types of Cookies We Use</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Strictly Necessary Cookies</h4>
                            <p className="text-gray-700 text-xs">
                                These are cookies that are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website, use a shopping cart or make use of e-billing services.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Analytical/Performance Cookies</h4>
                            <p className="text-gray-700 text-xs">
                                They allow us to recognise and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Functionality Cookies</h4>
                            <p className="text-gray-700 text-xs">
                                These are used to recognise you when you return to our website. This enables us to personalise our content for you, greet you by name and remember your preferences (for example, your choice of language or region).
                            </p>
                        </div>
                    </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-3">Cookies We Use</h3>

                <CookieTable title="Functionality Cookies">
                    <CookieRow 
                        description="Stripe"
                        purpose="Enable seamless Membership upgrading."
                    />
                </CookieTable>

                <CookieTable title="Analytical/Performance Cookies">
                    <CookieRow 
                        description="PostHog Analytics"
                        purpose="Website and product analytics to drive user experience improvements."
                    />
                    <CookieRow 
                        description="Apollo.io"
                        purpose="Evaluate and optimise the performance of email marketing campaigns."
                    />
                </CookieTable>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r mb-4">
                    <p className="text-blue-900 text-xs">
                        <strong>Managing Cookies:</strong> You can choose to enable or disable Cookies in your internet browser. By default, most internet browsers accept Cookies but this can be changed. For more information generally on cookies, including how to disable them, please refer to{' '}
                        <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="underline">
                            aboutcookies.org
                        </a>
                    </p>
                </div>
            </Section>

            <Section title="Links to Other Websites">
                <p className="text-gray-700 text-sm">
                    This Website may, from time to time, provide links to other websites. We have no control over such websites and are not responsible for the content of these websites. This Privacy Policy does not extend to your use of such websites. You are advised to read the Privacy Policy or statement of other websites prior to using them.
                </p>
            </Section>

            <Section title="Changes of Business Ownership and Control">
                <p className="text-gray-700 text-sm mb-3">
                    Independent Federation for Safeguarding may, from time to time, expand or reduce our business and this may involve the sale and/or the transfer of control of all or part of Independent Federation for Safeguarding. Data provided by Users will, where it is relevant to any part of our business so transferred, be transferred along with that part and the new owner or newly controlling party will, under the terms of this Privacy Policy, be permitted to use the Data for the purposes for which it was originally supplied to us.
                </p>
                <p className="text-gray-700 text-sm">
                    We may also disclose Data to a prospective purchaser of our business or any part of it. In the above instances, we will take steps with the aim of ensuring your privacy is protected.
                </p>
            </Section>

            <Section title="Changes to This Privacy Policy">
                <p className="text-gray-700 text-sm">
                    Independent Federation for Safeguarding reserves the right to change this Privacy Policy as we may deem necessary from time to time or as may be required by law. Any changes will be immediately posted on the Website and you are deemed to have accepted the terms of the Privacy Policy on your first use of the Website following the alterations.
                </p>
            </Section>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Questions About Our Privacy Policy?</h2>
                <p className="text-gray-700 text-sm mb-4">
                    If you have any questions about this Privacy Policy or how we handle your personal data, please don't hesitate to contact us.
                </p>
                <div className="space-y-2 text-sm">
                    <p className="text-gray-900">
                        <strong>Email:</strong>{' '}
                        <a href="mailto:info@ifs-safeguarding.co.uk" className="text-purple-600 hover:text-purple-700 underline">
                            info@ifs-safeguarding.co.uk
                        </a>
                    </p>
                    <p className="text-gray-900">
                        <strong>Address:</strong> 6-8 Revenge Road, Chatham, Kent, ME5 8UD
                    </p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>
                    This Privacy Policy was created on 8th November 2025
                </p>
            </div>
        </div>
    );
}