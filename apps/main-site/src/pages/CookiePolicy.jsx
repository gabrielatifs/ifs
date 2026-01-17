import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Cookie, Shield, Settings, Info, FileText } from 'lucide-react';

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

const CookieTable = ({ title, children }) => (
    <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">{title}</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-1/3">Name of Cookie</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);

const CookieRow = ({ name, purpose }) => (
    <tr className="border-b border-gray-200">
        <td className="px-4 py-3 text-gray-900 font-medium">{name}</td>
        <td className="px-4 py-3 text-gray-700">{purpose}</td>
    </tr>
);

const CookieTypeCard = ({ type, description, icon: Icon }) => (
    <div className="border-l-4 border-purple-600 pl-4 mb-4">
        <div className="flex items-start gap-3">
            {Icon && <Icon className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />}
            <div>
                <h4 className="font-semibold text-gray-900 mb-2">{type}</h4>
                <p className="text-gray-700 text-sm">{description}</p>
            </div>
        </div>
    </div>
);

export default function CookiePolicy() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                            <Cookie className="w-8 h-8 text-purple-600" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Cookie Policy
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Learn about how we use cookies to customise the Website and improve your experience. This policy explains what cookies are, how we use them, and how you can control them.
                        </p>
                        <p className="text-sm text-gray-400 mt-6">
                            Last updated: 8th November 2025
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Important Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12 rounded-r-lg">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-blue-900 mb-2">Cookie Consent</p>
                            <p className="text-blue-800 text-sm">
                                When you visit the Website, and before cookies are placed on your computer, you will be presented with a message bar requesting your consent. By giving your consent, you enable us to provide a better experience and service. You may deny consent; however, certain features may not function fully or as intended.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scope of This Policy */}
                <Section title="Scope of This Policy" numbered>
                    <li>Independent Federation for Safeguarding (we or us or our) uses cookies when you visit our website, https://ifs-safeguarding.co.uk/, (the Website) to help customise the Website and improve your experience using the Website.</li>
                    <li>This Policy applies between you, the user of this Website, and us, Independent Federation for Safeguarding, the owner and provider of this Website.</li>
                    <li>When you visit the Website, and before your Website places cookies on your computer, you will be presented with a message bar requesting your consent to set those cookies. By giving your consent to the placing of cookies, you are enabling us to provide a better experience and service. You may, if you wish, deny consent to the placing of these cookies; however, certain features of the Website may not function fully or as intended.</li>
                    <li>
                        This Cookie Policy should be read alongside, and in addition to, our Privacy Policy, which can be found at:{' '}
                        <Link to={createPageUrl('PrivacyPolicy')} className="text-purple-600 hover:text-purple-700 underline font-semibold">
                            Privacy Policy
                        </Link>
                    </li>
                </Section>

                {/* What Are Cookies? */}
                <Section title="What Are Cookies?" icon={Cookie} numbered>
                    <li>A cookie is a small text file placed on your computer by this Website when you visit certain parts of the Website and/or when you use certain features of the Website.</li>
                    <li>This Website may place and access certain cookies on your computer. We use these cookies to improve your experience of using the Website and to improve our range of products and services.</li>
                    <li>
                        Cookies do not usually contain any information that personally identifies you, as the Website user. However, personal information that we store about you may be linked to the information obtained from and stored in cookies. For more information on how such personal information is handled and stored, refer to our{' '}
                        <Link to={createPageUrl('PrivacyPolicy')} className="text-purple-600 hover:text-purple-700 underline">
                            Privacy Policy
                        </Link>.
                    </li>
                </Section>

                {/* Types of Cookies */}
                <Section title="Types of Cookies" icon={Shield}>
                    <p className="text-gray-700 mb-6">This Website uses the following cookies:</p>
                    
                    <div className="space-y-4 mb-6">
                        <CookieTypeCard 
                            type="Strictly Necessary Cookies"
                            description="These are cookies that are required for the operation of the Website. They include, for example, cookies that enable you to log into secure areas of the Website, use a shopping cart or make use of e-billing services."
                            icon={Shield}
                        />

                        <CookieTypeCard 
                            type="Analytical/Performance Cookies"
                            description="These cookies allow us to recognise and count the number of visitors and to see how visitors move around our Website when they are using it. This helps us to improve the way our Website works, for example, by ensuring that users are finding what they are looking for easily."
                            icon={FileText}
                        />

                        <CookieTypeCard 
                            type="Functionality Cookies"
                            description="These are used to recognise you when you return to our Website. This enables us to personalise our content for you, greet you by name and remember your preferences (for example, your choice of language or region). By using the Website, you agree to our placement of functionality cookies."
                            icon={Settings}
                        />
                    </div>

                    <ol className="list-decimal pl-6 space-y-3 text-gray-700" start="9">
                        <li>You can find a list of the cookies that we use in the Cookie Schedule below.</li>
                        <li>We have carefully chosen these cookies and have taken steps to ensure that your privacy is protected and respected at all times.</li>
                    </ol>
                </Section>

                {/* Cookie Schedule */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Schedule</h2>
                    <p className="text-gray-700 mb-8">
                        Below is a list of the cookies that we use. We have tried to ensure this is complete and up to date, but if you think that we have missed a cookie or there is any discrepancy, please let us know.
                    </p>

                    <CookieTable title="Strictly Necessary Cookies">
                        <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-500 italic" colSpan="2">
                                Currently, we do not use strictly necessary cookies beyond those required for basic website functionality.
                            </td>
                        </tr>
                    </CookieTable>

                    <CookieTable title="Functionality Cookies">
                        <CookieRow 
                            name="Stripe"
                            purpose="Enable seamless Membership upgrading."
                        />
                    </CookieTable>

                    <CookieTable title="Analytical/Performance Cookies">
                        <CookieRow 
                            name="PostHog Analytics"
                            purpose="Website and product analytics to drive user experience improvements."
                        />
                        <CookieRow 
                            name="Apollo.io"
                            purpose="Evaluate and optimise the performance of email marketing campaigns."
                        />
                    </CookieTable>
                </div>

                {/* How To Control Your Cookies */}
                <Section title="How To Control Your Cookies" icon={Settings} numbered>
                    <li>You can choose to enable or disable cookies in your internet browser. By default, most internet browsers accept cookies but this can be changed. For further details, please see the help menu in your internet browser.</li>
                    <li>You can switch off cookies at any time, however, you may lose information that enables you to access the Website more quickly and efficiently.</li>
                    <li>It is recommended that you ensure that your internet browser is up-to-date and that you consult the help and guidance provided by the developer of your internet browser if you are unsure about adjusting your privacy settings.</li>
                    <li>
                        For more information generally on cookies, including how to disable them, please refer to{' '}
                        <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                            aboutcookies.org
                        </a>
                        . You will also find details on how to delete cookies from your computer.
                    </li>
                </Section>

                {/* Changes To This Policy */}
                <Section title="Changes To This Policy">
                    <p className="text-gray-700">
                        Independent Federation for Safeguarding reserves the right to change this Cookie Policy as we may deem necessary from time to time or as may be required by law. Any changes will be immediately posted on the Website and you are deemed to have accepted the terms of the Cookie Policy on your first use of the Website following the alterations.
                    </p>
                </Section>

                {/* Contact Details */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Details</h2>
                    <p className="text-gray-700 mb-6">
                        The Website is owned by Independent Federation for Safeguarding incorporated in England and Wales with registered number <strong>16491485</strong>.
                    </p>
                    <div className="space-y-2">
                        <p className="text-gray-900">
                            <strong>Registered Address:</strong> 6-8 Revenge Road, Chatham, Kent, ME5 8UD
                        </p>
                        <p className="text-gray-900">
                            <strong>Email:</strong>{' '}
                            <a href="mailto:info@ifs-safeguarding.co.uk" className="text-purple-600 hover:text-purple-700 underline">
                                info@ifs-safeguarding.co.uk
                            </a>
                        </p>
                        <p className="text-gray-900">
                            <strong>Contact Form:</strong> You may also use the{' '}
                            <Link to={createPageUrl('Contact')} className="text-purple-600 hover:text-purple-700 underline">
                                contact form
                            </Link>
                            {' '}on the Website.
                        </p>
                    </div>
                </div>

                {/* Attribution */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>
                        This Cookie Policy was created on 8th November 2025 using a document from{' '}
                        <a href="https://www.rocketlawyer.com/gb/en" target="_blank" rel="noopener noreferrer" className="underline">
                            Rocket Lawyer
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}