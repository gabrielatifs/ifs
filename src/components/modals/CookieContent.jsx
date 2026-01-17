import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Info, Settings, Shield, FileText } from 'lucide-react';

const Section = ({ title, children, numbered }) => (
    <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="prose prose-slate max-w-none text-sm">
            {numbered ? (
                <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                    {children}
                </ol>
            ) : (
                children
            )}
        </div>
    </section>
);

const CookieTable = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-base font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg text-xs">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/3">Name of Cookie</th>
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

const CookieRow = ({ name, purpose }) => (
    <tr className="border-b border-gray-200">
        <td className="px-3 py-2 text-gray-900 font-medium text-xs">{name}</td>
        <td className="px-3 py-2 text-gray-700 text-xs">{purpose}</td>
    </tr>
);

const CookieTypeCard = ({ type, description, icon: Icon }) => (
    <div className="border-l-4 border-purple-600 pl-3 mb-3">
        <div className="flex items-start gap-2">
            {Icon && <Icon className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />}
            <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{type}</h4>
                <p className="text-gray-700 text-xs">{description}</p>
            </div>
        </div>
    </div>
);

export default function CookieContent() {
    return (
        <div className="prose prose-slate max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-blue-900 text-sm mb-2">Cookie Consent</p>
                        <p className="text-blue-800 text-xs">
                            When you visit the Website, and before cookies are placed on your computer, you will be presented with a message bar requesting your consent. By giving your consent, you enable us to provide a better experience and service. You may deny consent; however, certain features may not function fully or as intended.
                        </p>
                    </div>
                </div>
            </div>

            <Section title="Scope of This Policy" numbered>
                <li>Independent Federation for Safeguarding (we or us or our) uses cookies when you visit our website, https://ifs-safeguarding.co.uk/, (the Website) to help customise the Website and improve your experience using the Website.</li>
                <li>This Policy applies between you, the user of this Website, and us, Independent Federation for Safeguarding, the owner and provider of this Website.</li>
                <li>When you visit the Website, and before your Website places cookies on your computer, you will be presented with a message bar requesting your consent to set those cookies. By giving your consent to the placing of cookies, you are enabling us to provide a better experience and service. You may, if you wish, deny consent to the placing of these cookies; however, certain features of the Website may not function fully or as intended.</li>
                <li>
                    This Cookie Policy should be read alongside, and in addition to, our Privacy Policy, which can be found at:{' '}
                    <Link to={createPageUrl('PrivacyPolicy')} className="text-purple-600 hover:text-purple-700 underline font-semibold" target="_blank">
                        Privacy Policy
                    </Link>
                </li>
            </Section>

            <Section title="What Are Cookies?" numbered>
                <li>A cookie is a small text file placed on your computer by this Website when you visit certain parts of the Website and/or when you use certain features of the Website.</li>
                <li>This Website may place and access certain cookies on your computer. We use these cookies to improve your experience of using the Website and to improve our range of products and services.</li>
                <li>
                    Cookies do not usually contain any information that personally identifies you, as the Website user. However, personal information that we store about you may be linked to the information obtained from and stored in cookies. For more information on how such personal information is handled and stored, refer to our{' '}
                    <Link to={createPageUrl('PrivacyPolicy')} className="text-purple-600 hover:text-purple-700 underline" target="_blank">
                        Privacy Policy
                    </Link>.
                </li>
            </Section>

            <Section title="Types of Cookies">
                <p className="text-gray-700 text-sm mb-4">This Website uses the following cookies:</p>
                
                <div className="space-y-3 mb-5">
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

                <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm" start="9">
                    <li>You can find a list of the cookies that we use in the Cookie Schedule below.</li>
                    <li>We have carefully chosen these cookies and have taken steps to ensure that your privacy is protected and respected at all times.</li>
                </ol>
            </Section>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Cookie Schedule</h2>
                <p className="text-gray-700 text-sm mb-6">
                    Below is a list of the cookies that we use. We have tried to ensure this is complete and up to date, but if you think that we have missed a cookie or there is any discrepancy, please let us know.
                </p>

                <CookieTable title="Strictly Necessary Cookies">
                    <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-gray-500 italic text-xs" colSpan="2">
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

            <Section title="How To Control Your Cookies" numbered>
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

            <Section title="Changes To This Policy">
                <p className="text-gray-700 text-sm">
                    Independent Federation for Safeguarding reserves the right to change this Cookie Policy as we may deem necessary from time to time or as may be required by law. Any changes will be immediately posted on the Website and you are deemed to have accepted the terms of the Cookie Policy on your first use of the Website following the alterations.
                </p>
            </Section>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Details</h2>
                <p className="text-gray-700 text-sm mb-4">
                    The Website is owned by Independent Federation for Safeguarding incorporated in England and Wales with registered number <strong>16491485</strong>.
                </p>
                <div className="space-y-2 text-sm">
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
                        <Link to={createPageUrl('Contact')} className="text-purple-600 hover:text-purple-700 underline" target="_blank">
                            contact form
                        </Link>
                        {' '}on the Website.
                    </p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>This Cookie Policy was created on 8th November 2025</p>
            </div>
        </div>
    );
}