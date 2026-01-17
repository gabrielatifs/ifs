
import React, { useState } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Users, Award, Shield, Mail, ArrowRight } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import BoardMemberModal from '../components/marketing/BoardMemberModal';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function IfSBoard() {
    const [selectedMember, setSelectedMember] = useState(null);
    const { trackEvent } = usePostHog();

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'ifs_board_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const trustees = [
        {
            name: "Steve Kay",
            position: "Chair",
            background: `Steve brings over 25 years of leadership across local government, education, and the voluntary and community sector — focused on supporting children, families, and safeguarding at every level.

Steve's experience includes:
- Director of Belonging, Sheffield City Council
- Director of Schools & Employability, Birmingham City Council
- Former Assistant Director – Education & Early Help, Rochdale
- Non-Executive Director roles in youth, education, and cultural organisations`,
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/7e66d01a9_image.png"
        },
        {
            name: "Marcia Smikle",
            position: "Trustee",
            background: `Marcia is a Safeguarding Supervisor, Queens Nurse, and visiting Lecturer City St Georges University London. Marcia has experience working in the NHS in a number of distinct roles in which she has successfully combined management roles (strategic and operational) and maintained clinical skills which has given her a rounded view of services issues and what is important to frontline staff. Marcia has a proven history in providing sound leadership, addressing issues regarding diversity and inequalities which includes setting up a BME Staff Network, developing and managing award winning services. She is a member of the City and Hackney Safeguarding Children Partnership which commissioned and published in March 2022 the Local Child Safeguarding Practice Review into the Child Q incident.`,
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/542b7f883_image.png"
        },
        {
            name: "Paul Smith",
            position: "Trustee",
            background: `Paul is a very proud educator and brings over 30 years of leadership and governance expertise across national government departments and local authorities, and public and private education, care and clinical services for children and young people and their families, including the leadership of governance and governor services, and strategic and institutional safeguarding across local area partnerships in England, also overseas.

Paul has spent his career working in very challenging parts of England, prioritising his career investment into transforming the lives of the most disaffected, marginalised and vulnerable children and young people wherever he can make a difference, particularly in promoting and securing inclusivity for all regardless of their individual characteristics, needs or preferences.

Paul has worked nationally as a lead inspector of education (Ofsted) and internationally with governments in the Middle East. He is co-author of the UAE School Inspection Framework launched in 2014, where he was proud to embed inclusion, safeguarding, achievement and innovation into the framework in supporting the government to achieve the goals of the 2030 vision.

In leading local area partnerships for special educational needs and disabilities, though his strategic leadership of a number of education, inclusion and children’s services portfolios, Paul has at all times remained a passionate champion of children’s rights for an inclusive, holistic, relational, therapeutic, safe and happy journey into adulthood. He has challenged and supported partners and stakeholders to deliver this where he has been able to influence and lead.

Paul remains a lifelong learner and educator and continues to be inspired by the voice of children and young people, their families, and those who support and protect them, not least the many safeguarding professionals and support workers who work tirelessly to protect them from harm.

Paul’s dedication to children, inclusivity and relational practices supporting children and families, together with his expertise in system wide leadership and governance of safeguarding, culture and practice, makes him an exceptional voice in our mission to elevate safeguarding standards internationally for all who work with and on behalf of children and young people to safeguarding their futures.`,
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/5799f296c_image.png"
        },
        {
            name: "André Langlois",
            position: "Trustee",
            background: `André has over 20 years of experience in Human Resources and change management; in-house across several sectors, and as a consultant. He has served as a charity trustee in the past, and is currently a co-opted member of the remuneration committee at Lancaster University.`,
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/a07169ce6_image.png"
        },
        {
            name: "Simon Knowles",
            position: "Trustee",
            background: `Simon’s career in education spans more than three decades, with senior leadership and executive roles across a range of diverse schools in London — many serving disadvantaged communities.

Simon’s experience includes:
- Ofsted Inspector
- Chair of the Local Authority Headteachers' Consultative
- Executive Headteacher of three primary schools and two independent nurseries
- NPQ (National Professional Qualification) facilitator

Simon has developed strategies that have improved school performance and strengthened safeguarding practice.`,
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/ff30a0c86_image.png"
        },
        {
            name: "Affaq Razaq",
            position: "Trustee",
            background: `Affaq is a former Scotland Yard Detective Sergeant with extensive experience in safeguarding, child protection, and serious crime investigations.

In their current role as an Escalation Response Specialist for a leading social media company, Affaq manages online harms and critical incidents.

With a background in law and a strong commitment to protecting vulnerable communities, Affaq brings both frontline and strategic safeguarding expertise to the Trustee role.`,
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/26f1de779_image.png"
        }
    ];

    const staffAttendees = [
        {
            name: "Jennifer Marshall",
            position: "Chief Executive Officer",
            background: "Jennifer brings over 25 years of leadership in education — focused on safeguarding, equality, and inclusion - supporting people to thrive in education, at work and in life.\n\nJennifer spent a large portion of her career leading education in parts of London with high levels of deprivation, focused on empowering marginalised, disadvantaged and vulnerable children, young people and adults.\n\nDriven by her own lived experiences, Jennifer’s unwavering commitment to safeguarding, equity and inclusivity inspires our mission - to empower safeguarding professionals with the resources, knowledge, and survivor-informed insights they need to protect children and vulnerable adults.",
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6a7c77d1e_image.png"
        },
        {
            name: "Gabriel Brown",
            position: "Chief Operating Officer",
            background: "Gabriel Brown is Chief Operating Officer at the Independent Federation for Safeguarding, leading on operations, systems strategy, and organisational growth. He previously co-founded a safeguarding software company that provided digital tools to protect over 10,000 young people across UK schools and colleges. With experience in counter-extremism and policy advisory work, Gabriel has delivered operational systems that strengthen safeguarding outcomes and improve service delivery.",
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/85e51faf3_image.png"
        }
    ];


    return (
        <>
            {selectedMember && <BoardMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                        alt="Professional board meeting"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                ></div>
                <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="IfSBoard" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Meet Our Board of Trustees
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Discover the experienced professionals leading IfS towards our mission.
                                </p>
                                <p className="hidden lg:block">
                                    Our Board of Trustees brings together decades of safeguarding expertise, providing strategic oversight and ensuring we serve our members effectively.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const boardSection = document.getElementById('board-members');
                                        if (boardSection) {
                                            boardSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Meet the Board
                                </Button>
                                <Button
                                  onClick={() => handleJoin('ifs_board_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('ifs_board_hero_mobile')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Board Introduction Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Experienced leadership for the safeguarding community
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Our Board of Trustees brings together leading professionals from across the safeguarding sector, including education, social care, law enforcement, healthcare, and legal practice.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Each member brings unique expertise and a shared commitment to advancing safeguarding practice through professional development, community building, and advocacy for excellence in child and vulnerable adult protection.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Board Members Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16" id="board-members">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Our Board of Trustees
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Dedicated professionals committed to supporting and advancing safeguarding practice across the UK.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {trustees.map((member, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
                                onClick={() => setSelectedMember(member)}
                            >
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-black mb-1">{member.name}</h3>
                                    <p className="text-purple-600 font-semibold mb-4">{member.position}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{member.background}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Staff Attendees Section */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                            Staff Attending Board Meetings
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our senior leadership team works closely with the Board of Trustees to implement strategy and manage operations.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {staffAttendees.map((member, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
                                onClick={() => setSelectedMember(member)}
                            >
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-black mb-1">{member.name}</h3>
                                    <p className="text-purple-600 font-semibold mb-4">{member.position}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{member.background}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Board Responsibilities Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                            Board Responsibilities
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our Board ensures effective governance, strategic direction, and accountability to our members and the wider safeguarding community.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-4">Strategic Leadership</h3>
                            <p className="text-gray-600 leading-relaxed">Setting the long-term vision and strategic direction for the organization, ensuring we continue to serve our members effectively.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-4">Financial Oversight</h3>
                            <p className="text-gray-600 leading-relaxed">Ensuring responsible financial management and sustainability to support our mission and member services.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-4">Quality Assurance</h3>
                            <p className="text-gray-600 leading-relaxed">Maintaining the highest standards in all our services, training, and professional development offerings.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-4">Member Advocacy</h3>
                            <p className="text-gray-600 leading-relaxed">Representing member interests and ensuring their voices are heard in policy development and sector advocacy.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-4">Risk Management</h3>
                            <p className="text-gray-600 leading-relaxed">Identifying and managing organizational risks to protect the federation and its members.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold text-black mb-4">Governance Compliance</h3>
                            <p className="text-gray-600 leading-relaxed">Ensuring compliance with all legal, regulatory, and constitutional requirements for the organization.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Join a community led by experts
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Become part of the IfS and benefit from the expertise and guidance of our experienced Board of Trustees.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('ifs_board_bottom_cta')}
                            size="lg"
                            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-sm"
                        >
                            Become a Member
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm"
                            asChild
                        >
                            <Link to={createPageUrl("Governance")}>Back to Governance</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
