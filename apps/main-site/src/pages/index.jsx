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

                    {/* Main site routes */}
                    <Route path="/About" element={<About />} />
                    <Route path="/ApplicationPending" element={<ApplicationPending />} />
                    <Route path="/ArticlesOfAssociation" element={<ArticlesOfAssociation />} />
                    <Route path="/Conferences" element={<Conferences />} />
                    <Route path="/Contact" element={<Contact />} />
                    <Route path="/CookiePolicy" element={<CookiePolicy />} />
                    <Route path="/EventRegistrationSuccess" element={<EventRegistrationSuccess />} />
                    <Route path="/ForumsAndWorkshops" element={<ForumsAndWorkshops />} />
                    <Route path="/Governance" element={<Governance />} />
                    <Route path="/Home" element={<Home />} />
                    <Route path="/IfSBoard" element={<IfSBoard />} />
                    <Route path="/JobsBoardMarketing" element={<JobsBoardMarketing />} />
                    <Route path="/JoinUs" element={<JoinUs />} />
                    <Route path="/joinus" element={<JoinUs />} />
                    <Route path="/MemberAccessRequired" element={<MemberAccessRequired />} />
                    <Route path="/MembershipPlans" element={<MembershipPlans />} />
                    <Route path="/MembershipTiers" element={<MembershipTiers />} />
                    <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                    <Route path="/RegisteredOrganisation" element={<RegisteredOrganisation />} />
                    <Route path="/ResearchAndAdvocacy" element={<ResearchAndAdvocacy />} />
                    <Route path="/SignpostingService" element={<SignpostingService />} />
                    <Route path="/Sitemap" element={<Sitemap />} />
                    <Route path="/SupervisionServicesMarketing" element={<SupervisionServicesMarketing />} />
                    <Route path="/Team" element={<Team />} />
                    <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                    <Route path="/VerifyCredential" element={<VerifyCredential />} />

                    {/* Membership folder routes */}
                    <Route path="/membership" element={<Membership />} />
                    <Route path="/membership/associate-membership" element={<AssociateMembership />} />
                    <Route path="/membership/full-membership" element={<FullMembership />} />
                    <Route path="/membership/fellowship" element={<Fellowship />} />
                    <Route path="/membership/member-benefits" element={<MemberBenefits />} />
                    <Route path="/membership/why-join-us" element={<WhyJoinUs />} />
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

                    {/* Training folder routes */}
                    <Route path="/training" element={<Training />} />
                    <Route path="/training/cpd-training" element={<CPDTrainingMarketing />} />
                    <Route path="/training/introductory-courses" element={<IntroductoryCourses />} />
                    <Route path="/training/advanced-courses" element={<AdvancedCourses />} />
                    <Route path="/training/refresher-courses" element={<RefresherCourses />} />
                    <Route path="/training/specialist-courses" element={<SpecialistCourses />} />
                    <Route path="/training/:slug" element={<TrainingCourseDetails />} />
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

                    {/* Events folder routes */}
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/Events" element={<Navigate to="/events" replace />} />
                    <Route path="/EventDetails" element={<Navigate to="/events" replace />} />
                    <Route path="/event/:id" element={<EventLegacyRedirect />} />

                    {/* Jobs folder routes */}
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:slug" element={<JobDetailsPublic />} />
                    <Route path="/Jobs" element={<Navigate to="/jobs" replace />} />
                    <Route path="/job" element={<Navigate to="/jobs" replace />} />
                    <Route path="/job/:slug" element={<JobLegacyRedirect />} />
                    <Route path="/join" element={<Navigate to="/jobs" replace />} />
                    <Route path="/join/:slug" element={<JobLegacyRedirect />} />
                    <Route path="/Job" element={<Navigate to="/jobs" replace />} />
                    <Route path="/JobDetailsPublic" element={<Navigate to="/jobs" replace />} />

                    {/* Clean URL slugs */}
                    <Route path="/about" element={<About />} />
                    <Route path="/why-join-us" element={<Navigate to="/membership/why-join-us" replace />} />
                    <Route path="/associate-membership" element={<Navigate to="/membership/associate-membership" replace />} />
                    <Route path="/full-membership" element={<Navigate to="/membership/full-membership" replace />} />
                    <Route path="/member-benefits" element={<Navigate to="/membership/member-benefits" replace />} />
                    <Route path="/fellowship" element={<Navigate to="/membership/fellowship" replace />} />
                    <Route path="/membership-tiers" element={<MembershipTiers />} />
                    <Route path="/membership-plans" element={<MembershipPlans />} />
                    <Route path="/registered-organisation" element={<RegisteredOrganisation />} />
                    <Route path="/supervision" element={<SupervisionServicesMarketing />} />
                    <Route path="/signposting" element={<SignpostingService />} />
                    <Route path="/event-registration-success" element={<EventRegistrationSuccess />} />
                    <Route path="/conferences" element={<Conferences />} />
                    <Route path="/forums-and-workshops" element={<ForumsAndWorkshops />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/board" element={<IfSBoard />} />
                    <Route path="/governance" element={<Governance />} />
                    <Route path="/articles-of-association" element={<ArticlesOfAssociation />} />
                    <Route path="/research" element={<ResearchAndAdvocacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/sitemap" element={<Sitemap />} />
                    <Route path="/verify" element={<VerifyCredential />} />
                    <Route path="/application-pending" element={<ApplicationPending />} />
                    <Route path="/member-access-required" element={<MemberAccessRequired />} />

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}
