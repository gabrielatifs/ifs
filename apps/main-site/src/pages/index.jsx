import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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
import TermsAndConditions from "./TermsAndConditions";
import Training from "./Training";
import TrainingCourseDetails from "./TrainingCourseDetails";
import VerifyCredential from "./VerifyCredential";
import WhyJoinUs from "./WhyJoinUs";

export default function Pages() {
    return (
        <Router>
            <Layout currentPageName="MainSite">
                <Routes>
                    {/* Default route */}
                    <Route path="/" element={<Home />} />

                    {/* Main site routes */}
                    <Route path="/About" element={<About />} />
                    <Route path="/AdvancedCourses" element={<AdvancedCourses />} />
                    <Route path="/ApplicationPending" element={<ApplicationPending />} />
                    <Route path="/ArticlesOfAssociation" element={<ArticlesOfAssociation />} />
                    <Route path="/AssociateMembership" element={<AssociateMembership />} />
                    <Route path="/Conferences" element={<Conferences />} />
                    <Route path="/Contact" element={<Contact />} />
                    <Route path="/CookiePolicy" element={<CookiePolicy />} />
                    <Route path="/CPDTrainingMarketing" element={<CPDTrainingMarketing />} />
                    <Route path="/EventDetails" element={<EventDetails />} />
                    <Route path="/EventRegistrationSuccess" element={<EventRegistrationSuccess />} />
                    <Route path="/Events" element={<Events />} />
                    <Route path="/Fellowship" element={<Fellowship />} />
                    <Route path="/ForumsAndWorkshops" element={<ForumsAndWorkshops />} />
                    <Route path="/FullMembership" element={<FullMembership />} />
                    <Route path="/Governance" element={<Governance />} />
                    <Route path="/Home" element={<Home />} />
                    <Route path="/IfSBoard" element={<IfSBoard />} />
                    <Route path="/IntroductoryCourses" element={<IntroductoryCourses />} />
                    <Route path="/Jobs" element={<Jobs />} />
                    <Route path="/JobsBoardMarketing" element={<JobsBoardMarketing />} />
                    <Route path="/JoinUs" element={<JoinUs />} />
                    <Route path="/MemberAccessRequired" element={<MemberAccessRequired />} />
                    <Route path="/MemberBenefits" element={<MemberBenefits />} />
                    <Route path="/Membership" element={<Membership />} />
                    <Route path="/MembershipPlans" element={<MembershipPlans />} />
                    <Route path="/MembershipTiers" element={<MembershipTiers />} />
                    <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                    <Route path="/RefresherCourses" element={<RefresherCourses />} />
                    <Route path="/RegisteredOrganisation" element={<RegisteredOrganisation />} />
                    <Route path="/ResearchAndAdvocacy" element={<ResearchAndAdvocacy />} />
                    <Route path="/SignpostingService" element={<SignpostingService />} />
                    <Route path="/SpecialistCourses" element={<SpecialistCourses />} />
                    <Route path="/SupervisionServicesMarketing" element={<SupervisionServicesMarketing />} />
                    <Route path="/Team" element={<Team />} />
                    <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                    <Route path="/Training" element={<Training />} />
                    <Route path="/TrainingCourseDetails" element={<TrainingCourseDetails />} />
                    <Route path="/VerifyCredential" element={<VerifyCredential />} />
                    <Route path="/WhyJoinUs" element={<WhyJoinUs />} />

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}
