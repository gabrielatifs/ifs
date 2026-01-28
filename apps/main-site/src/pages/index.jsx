import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';

// Import all main site pages
import About from "./About";
import AdvancedCourses from "./AdvancedCourses";
import ApplicationPending from "./ApplicationPending";
import ArticlesOfAssociation from "./ArticlesOfAssociation";
import AssociateMembership from "./AssociateMembership";
import Conferences from "./Conferences";
import Contact from "./Contact";
import CookiePolicy from "./CookiePolicy";
import CPDTrainingMarketing from "./CPDTrainingMarketing";
import EventDetails from "./EventDetails";
import EventRegistrationSuccess from "./EventRegistrationSuccess";
import Events from "./Events";
import Fellowship from "./Fellowship";
import ForumsAndWorkshops from "./ForumsAndWorkshops";
import FullMembership from "./FullMembership";
import Governance from "./Governance";
import Home from "./Home";
import IfSBoard from "./IfSBoard";
import IntroductoryCourses from "./IntroductoryCourses";
import JobDetailsPublic from "./JobDetailsPublic";
import Jobs from "./Jobs";
import JobsBoardMarketing from "./JobsBoardMarketing";
import JoinUs from "./JoinUs";
import MemberAccessRequired from "./MemberAccessRequired";
import MemberBenefits from "./MemberBenefits";
import Membership from "./Membership";
import MembershipPlans from "./MembershipPlans";
import MembershipTiers from "./MembershipTiers";
import NotFound from "./NotFound";
import PrivacyPolicy from "./PrivacyPolicy";
import RefresherCourses from "./RefresherCourses";
import RegisteredOrganisation from "./RegisteredOrganisation";
import ResearchAndAdvocacy from "./ResearchAndAdvocacy";
import SignpostingService from "./SignpostingService";
import SpecialistCourses from "./SpecialistCourses";
import SupervisionServicesMarketing from "./SupervisionServicesMarketing";
import Team from "./Team";
import Sitemap from "./Sitemap";
import TermsAndConditions from "./TermsAndConditions";
import Training from "./Training";
import TrainingCourseDetails from "./TrainingCourseDetails";
import VerifyCredential from "./VerifyCredential";
import WhyJoinUs from "./WhyJoinUs";

const JobLegacyRedirect = () => {
    const { slug } = useParams();
    return <Navigate to={`/jobs/${slug}`} replace />;
};

const EventLegacyRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`/events/${id}`} replace />;
};

const CourseLegacyRedirect = () => {
    const { slug } = useParams();
    return <Navigate to={`/training/${slug}`} replace />;
};

export default function Pages() {
    return (
        <Router>
            <Layout currentPageName="MainSite">
                <Routes>
                    {/* Default route */}
                    <Route path="/" element={<Home />} />

                    {/* ===== Component routes (must come before legacy redirects) ===== */}
                    {/* React Router v7 matches routes case-insensitively by default. */}
                    {/* Component routes must be defined before same-cased redirects */}
                    {/* to prevent redirects from shadowing actual page components. */}

                    {/* Standalone page routes */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/governance" element={<Governance />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/conferences" element={<Conferences />} />
                    <Route path="/sitemap" element={<Sitemap />} />
                    <Route path="/board" element={<IfSBoard />} />
                    <Route path="/articles-of-association" element={<ArticlesOfAssociation />} />
                    <Route path="/research" element={<ResearchAndAdvocacy />} />
                    <Route path="/jobs-board" element={<JobsBoardMarketing />} />
                    <Route path="/join-us" element={<JoinUs />} />
                    <Route path="/membership-tiers" element={<MembershipTiers />} />
                    <Route path="/membership-plans" element={<MembershipPlans />} />
                    <Route path="/registered-organisation" element={<RegisteredOrganisation />} />
                    <Route path="/supervision" element={<SupervisionServicesMarketing />} />
                    <Route path="/signposting" element={<SignpostingService />} />
                    <Route path="/event-registration-success" element={<EventRegistrationSuccess />} />
                    <Route path="/forums-and-workshops" element={<ForumsAndWorkshops />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/verify" element={<VerifyCredential />} />
                    <Route path="/application-pending" element={<ApplicationPending />} />
                    <Route path="/member-access-required" element={<MemberAccessRequired />} />

                    {/* Membership folder routes */}
                    <Route path="/membership" element={<Membership />} />
                    <Route path="/membership/associate-membership" element={<AssociateMembership />} />
                    <Route path="/membership/full-membership" element={<FullMembership />} />
                    <Route path="/membership/fellowship" element={<Fellowship />} />
                    <Route path="/membership/member-benefits" element={<MemberBenefits />} />
                    <Route path="/membership/why-join-us" element={<WhyJoinUs />} />

                    {/* Training folder routes */}
                    <Route path="/training" element={<Training />} />
                    <Route path="/training/cpd-training" element={<CPDTrainingMarketing />} />
                    <Route path="/training/introductory-courses" element={<IntroductoryCourses />} />
                    <Route path="/training/advanced-courses" element={<AdvancedCourses />} />
                    <Route path="/training/refresher-courses" element={<RefresherCourses />} />
                    <Route path="/training/specialist-courses" element={<SpecialistCourses />} />
                    <Route path="/training/:slug" element={<TrainingCourseDetails />} />

                    {/* Events folder routes */}
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />

                    {/* Jobs folder routes */}
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:slug" element={<JobDetailsPublic />} />

                    {/* ===== Legacy redirects (after component routes) ===== */}
                    {/* PascalCase and old URL redirects to canonical lowercase URLs */}

                    {/* Standalone page redirects */}
                    <Route path="/About" element={<Navigate to="/about" replace />} />
                    <Route path="/Contact" element={<Navigate to="/contact" replace />} />
                    <Route path="/Conferences" element={<Navigate to="/conferences" replace />} />
                    <Route path="/Governance" element={<Navigate to="/governance" replace />} />
                    <Route path="/Team" element={<Navigate to="/team" replace />} />
                    <Route path="/Sitemap" element={<Navigate to="/sitemap" replace />} />
                    <Route path="/Home" element={<Navigate to="/" replace />} />
                    <Route path="/IfSBoard" element={<Navigate to="/board" replace />} />
                    <Route path="/ApplicationPending" element={<Navigate to="/application-pending" replace />} />
                    <Route path="/ArticlesOfAssociation" element={<Navigate to="/articles-of-association" replace />} />
                    <Route path="/CookiePolicy" element={<Navigate to="/cookie-policy" replace />} />
                    <Route path="/EventRegistrationSuccess" element={<Navigate to="/event-registration-success" replace />} />
                    <Route path="/ForumsAndWorkshops" element={<Navigate to="/forums-and-workshops" replace />} />
                    <Route path="/JobsBoardMarketing" element={<Navigate to="/jobs-board" replace />} />
                    <Route path="/JoinUs" element={<Navigate to="/join-us" replace />} />
                    <Route path="/joinus" element={<Navigate to="/join-us" replace />} />
                    <Route path="/MemberAccessRequired" element={<Navigate to="/member-access-required" replace />} />
                    <Route path="/MembershipPlans" element={<Navigate to="/membership-plans" replace />} />
                    <Route path="/MembershipTiers" element={<Navigate to="/membership-tiers" replace />} />
                    <Route path="/PrivacyPolicy" element={<Navigate to="/privacy-policy" replace />} />
                    <Route path="/RegisteredOrganisation" element={<Navigate to="/registered-organisation" replace />} />
                    <Route path="/ResearchAndAdvocacy" element={<Navigate to="/research" replace />} />
                    <Route path="/SignpostingService" element={<Navigate to="/signposting" replace />} />
                    <Route path="/SupervisionServicesMarketing" element={<Navigate to="/supervision" replace />} />
                    <Route path="/TermsAndConditions" element={<Navigate to="/terms" replace />} />
                    <Route path="/VerifyCredential" element={<Navigate to="/verify" replace />} />

                    {/* Membership legacy redirects */}
                    <Route path="/Membership" element={<Navigate to="/membership" replace />} />
                    <Route path="/Membership/AssociateMembership" element={<Navigate to="/membership/associate-membership" replace />} />
                    <Route path="/Membership/FullMembership" element={<Navigate to="/membership/full-membership" replace />} />
                    <Route path="/Membership/Fellowship" element={<Navigate to="/membership/fellowship" replace />} />
                    <Route path="/Membership/MemberBenefits" element={<Navigate to="/membership/member-benefits" replace />} />
                    <Route path="/Membership/WhyJoinUs" element={<Navigate to="/membership/why-join-us" replace />} />
                    <Route path="/AssociateMembership" element={<Navigate to="/membership/associate-membership" replace />} />
                    <Route path="/FullMembership" element={<Navigate to="/membership/full-membership" replace />} />
                    <Route path="/Fellowship" element={<Navigate to="/membership/fellowship" replace />} />
                    <Route path="/MemberBenefits" element={<Navigate to="/membership/member-benefits" replace />} />
                    <Route path="/WhyJoinUs" element={<Navigate to="/membership/why-join-us" replace />} />
                    <Route path="/why-join-us" element={<Navigate to="/membership/why-join-us" replace />} />
                    <Route path="/associate-membership" element={<Navigate to="/membership/associate-membership" replace />} />
                    <Route path="/full-membership" element={<Navigate to="/membership/full-membership" replace />} />
                    <Route path="/member-benefits" element={<Navigate to="/membership/member-benefits" replace />} />
                    <Route path="/fellowship" element={<Navigate to="/membership/fellowship" replace />} />

                    {/* Training legacy redirects */}
                    <Route path="/Training" element={<Navigate to="/training" replace />} />
                    <Route path="/Training/IntroductoryCourses" element={<Navigate to="/training/introductory-courses" replace />} />
                    <Route path="/Training/AdvancedCourses" element={<Navigate to="/training/advanced-courses" replace />} />
                    <Route path="/Training/RefresherCourses" element={<Navigate to="/training/refresher-courses" replace />} />
                    <Route path="/Training/SpecialistCourses" element={<Navigate to="/training/specialist-courses" replace />} />
                    <Route path="/IntroductoryCourses" element={<Navigate to="/training/introductory-courses" replace />} />
                    <Route path="/AdvancedCourses" element={<Navigate to="/training/advanced-courses" replace />} />
                    <Route path="/RefresherCourses" element={<Navigate to="/training/refresher-courses" replace />} />
                    <Route path="/SpecialistCourses" element={<Navigate to="/training/specialist-courses" replace />} />
                    <Route path="/courses" element={<Navigate to="/training" replace />} />
                    <Route path="/CPDTrainingMarketing" element={<Navigate to="/training/cpd-training" replace />} />
                    <Route path="/course/:slug" element={<CourseLegacyRedirect />} />
                    <Route path="/TrainingCourseDetails" element={<Navigate to="/training" replace />} />
                    <Route path="/trainingcoursedetails" element={<Navigate to="/training" replace />} />

                    {/* Events legacy redirects */}
                    <Route path="/Events" element={<Navigate to="/events" replace />} />
                    <Route path="/EventDetails" element={<Navigate to="/events" replace />} />
                    <Route path="/event/:id" element={<EventLegacyRedirect />} />

                    {/* Jobs legacy redirects */}
                    <Route path="/Jobs" element={<Navigate to="/jobs" replace />} />
                    <Route path="/job" element={<Navigate to="/jobs" replace />} />
                    <Route path="/job/:slug" element={<JobLegacyRedirect />} />
                    <Route path="/join" element={<Navigate to="/jobs" replace />} />
                    <Route path="/join/:slug" element={<JobLegacyRedirect />} />
                    <Route path="/Job" element={<Navigate to="/jobs" replace />} />
                    <Route path="/JobDetailsPublic" element={<Navigate to="/jobs" replace />} />

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}
