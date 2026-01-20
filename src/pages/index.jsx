import Layout from "./Layout.jsx";

import About from "./About";

import AdminDashboard from "./AdminDashboard";


import AdvancedCourses from "./AdvancedCourses";

import ApplicationPending from "./ApplicationPending";

import ApplicationProcessing from "./ApplicationProcessing";

import ArticlesOfAssociation from "./ArticlesOfAssociation";

import AssociateMembership from "./AssociateMembership";

import CPDTraining from "./CPDTraining";

import CPDTrainingMarketing from "./CPDTrainingMarketing";

import CommunityEventDetails from "./CommunityEventDetails";

import CommunityEvents from "./CommunityEvents";

import Conferences from "./Conferences";

import Contact from "./Contact";

import CookiePolicy from "./CookiePolicy";

import CourseDetails from "./CourseDetails";

import Dashboard from "./Dashboard";

import EditCourse from "./EditCourse";

import EditEvent from "./EditEvent";

import EditJob from "./EditJob";

import EditSurvey from "./EditSurvey";

import EditUser from "./EditUser";

import EventDetails from "./EventDetails";

import EventRegistrationSuccess from "./EventRegistrationSuccess";

import Events from "./Events";

import Fellowship from "./Fellowship";

import Forum from "./Forum";

import ForumPostDetails from "./ForumPostDetails";

import ForumsAndWorkshops from "./ForumsAndWorkshops";

import FullMembership from "./FullMembership";

import Governance from "./Governance";

import Home from "./Home";

import IfSBoard from "./IfSBoard";

import IntroductoryCourses from "./IntroductoryCourses";

import Job from "./Job";

import JobDetails from "./JobDetails";

import Jobs from "./Jobs";

import JobsBoard from "./JobsBoard";

import JobsBoardMarketing from "./JobsBoardMarketing";

import JoinUs from "./JoinUs";

import ManageOrgSubscription from "./ManageOrgSubscription";

import ManageOrganisation from "./ManageOrganisation";

import MasterclassDetails from "./MasterclassDetails";

import MemberAccessRequired from "./MemberAccessRequired";

import MemberBenefits from "./MemberBenefits";

import MemberMasterclasses from "./MemberMasterclasses";

import Membership from "./Membership";

import MembershipPlans from "./MembershipPlans";

import MembershipTiers from "./MembershipTiers";

import MyCertificates from "./MyCertificates";

import MyCreditHistory from "./MyCreditHistory";

import MyMasterclassBookings from "./MyMasterclassBookings";

import MyProfile from "./MyProfile";

import News from "./News";

import NotFound from "./NotFound";

import Onboarding from "./Onboarding";

import OrgAnalytics from "./OrgAnalytics";

import OrgInvoices from "./OrgInvoices";

import OrgJobs from "./OrgJobs";

import OrgMembers from "./OrgMembers";

import OrgPayment from "./OrgPayment";

import OrgProfile from "./OrgProfile";

import Organisation from "./Organisation";

import OrganisationMembership from "./OrganisationMembership";

import PortalMembershipTiers from "./PortalMembershipTiers";

import PrivacyPolicy from "./PrivacyPolicy";

import Referral from "./Referral";

import RefresherCourses from "./RefresherCourses";

import RegisteredOrganisation from "./RegisteredOrganisation";

import RequestOrgPayment from "./RequestOrgPayment";

import ResearchAndAdvocacy from "./ResearchAndAdvocacy";

import SignpostingService from "./SignpostingService";

import SpecialistCourses from "./SpecialistCourses";

import SupervisionServices from "./SupervisionServices";

import SupervisionServicesMarketing from "./SupervisionServicesMarketing";


import Survey from "./Survey";

import SurveyResponses from "./SurveyResponses";

import Team from "./Team";

import TermsAndConditions from "./TermsAndConditions";

import Training from "./Training";

import TrainingCourseDetails from "./TrainingCourseDetails";

import TrusteeElections from "./TrusteeElections";

import VerifyCredential from "./VerifyCredential";

import WhyJoinUs from "./WhyJoinUs";

import YourVoice from "./YourVoice";

import about from "./about";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    About: About,
    
    AdminDashboard: AdminDashboard,
    
    
    AdvancedCourses: AdvancedCourses,
    
    ApplicationPending: ApplicationPending,
    
    ApplicationProcessing: ApplicationProcessing,
    
    ArticlesOfAssociation: ArticlesOfAssociation,
    
    AssociateMembership: AssociateMembership,
    
    CPDTraining: CPDTraining,
    
    CPDTrainingMarketing: CPDTrainingMarketing,
    
    CommunityEventDetails: CommunityEventDetails,
    
    CommunityEvents: CommunityEvents,
    
    Conferences: Conferences,
    
    Contact: Contact,
    
    CookiePolicy: CookiePolicy,
    
    CourseDetails: CourseDetails,
    
    Dashboard: Dashboard,
    
    EditCourse: EditCourse,
    
    EditEvent: EditEvent,
    
    EditJob: EditJob,
    
    EditSurvey: EditSurvey,
    
    EditUser: EditUser,
    
    EventDetails: EventDetails,
    
    EventRegistrationSuccess: EventRegistrationSuccess,
    
    Events: Events,
    
    Fellowship: Fellowship,
    
    Forum: Forum,
    
    ForumPostDetails: ForumPostDetails,
    
    ForumsAndWorkshops: ForumsAndWorkshops,
    
    FullMembership: FullMembership,
    
    Governance: Governance,
    
    Home: Home,
    
    IfSBoard: IfSBoard,
    
    IntroductoryCourses: IntroductoryCourses,
    
    Job: Job,
    
    JobDetails: JobDetails,
    
    Jobs: Jobs,
    
    JobsBoard: JobsBoard,
    
    JobsBoardMarketing: JobsBoardMarketing,
    
    JoinUs: JoinUs,
    
    ManageOrgSubscription: ManageOrgSubscription,
    
    ManageOrganisation: ManageOrganisation,
    
    MasterclassDetails: MasterclassDetails,
    
    MemberAccessRequired: MemberAccessRequired,
    
    MemberBenefits: MemberBenefits,
    
    MemberMasterclasses: MemberMasterclasses,
    
    Membership: Membership,
    
    MembershipPlans: MembershipPlans,
    
    MembershipTiers: MembershipTiers,
    
    MyCertificates: MyCertificates,
    
    MyCreditHistory: MyCreditHistory,
    
    MyMasterclassBookings: MyMasterclassBookings,
    
    MyProfile: MyProfile,
    
    News: News,
    
    NotFound: NotFound,
    
    Onboarding: Onboarding,
    
    OrgAnalytics: OrgAnalytics,
    
    OrgInvoices: OrgInvoices,
    
    OrgJobs: OrgJobs,
    
    OrgMembers: OrgMembers,
    
    OrgPayment: OrgPayment,
    
    OrgProfile: OrgProfile,
    
    Organisation: Organisation,
    
    OrganisationMembership: OrganisationMembership,
    
    PortalMembershipTiers: PortalMembershipTiers,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Referral: Referral,
    
    RefresherCourses: RefresherCourses,
    
    RegisteredOrganisation: RegisteredOrganisation,
    
    RequestOrgPayment: RequestOrgPayment,
    
    ResearchAndAdvocacy: ResearchAndAdvocacy,
    
    SignpostingService: SignpostingService,
    
    SpecialistCourses: SpecialistCourses,
    
    SupervisionServices: SupervisionServices,
    
    SupervisionServicesMarketing: SupervisionServicesMarketing,
    
    
    Survey: Survey,
    
    SurveyResponses: SurveyResponses,
    
    Team: Team,
    
    TermsAndConditions: TermsAndConditions,
    
    Training: Training,
    
    TrainingCourseDetails: TrainingCourseDetails,
    
    TrusteeElections: TrusteeElections,
    
    VerifyCredential: VerifyCredential,
    
    WhyJoinUs: WhyJoinUs,
    
    YourVoice: YourVoice,
    
    about: about,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<About />} />
                
                
                <Route path="/About" element={<About />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                
                <Route path="/AdvancedCourses" element={<AdvancedCourses />} />
                
                <Route path="/ApplicationPending" element={<ApplicationPending />} />
                
                <Route path="/ApplicationProcessing" element={<ApplicationProcessing />} />
                
                <Route path="/ArticlesOfAssociation" element={<ArticlesOfAssociation />} />
                
                <Route path="/AssociateMembership" element={<AssociateMembership />} />
                
                <Route path="/CPDTraining" element={<CPDTraining />} />
                
                <Route path="/CPDTrainingMarketing" element={<CPDTrainingMarketing />} />
                
                <Route path="/CommunityEventDetails" element={<CommunityEventDetails />} />
                
                <Route path="/CommunityEvents" element={<CommunityEvents />} />
                
                <Route path="/Conferences" element={<Conferences />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/CookiePolicy" element={<CookiePolicy />} />
                
                <Route path="/CourseDetails" element={<CourseDetails />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/EditCourse" element={<EditCourse />} />
                
                <Route path="/EditEvent" element={<EditEvent />} />
                
                <Route path="/EditJob" element={<EditJob />} />
                
                <Route path="/EditSurvey" element={<EditSurvey />} />
                
                <Route path="/EditUser" element={<EditUser />} />
                
                <Route path="/EventDetails" element={<EventDetails />} />
                
                <Route path="/EventRegistrationSuccess" element={<EventRegistrationSuccess />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/Fellowship" element={<Fellowship />} />
                
                <Route path="/Forum" element={<Forum />} />
                
                <Route path="/ForumPostDetails" element={<ForumPostDetails />} />
                
                <Route path="/ForumsAndWorkshops" element={<ForumsAndWorkshops />} />
                
                <Route path="/FullMembership" element={<FullMembership />} />
                
                <Route path="/Governance" element={<Governance />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/IfSBoard" element={<IfSBoard />} />
                
                <Route path="/IntroductoryCourses" element={<IntroductoryCourses />} />
                
                <Route path="/Job" element={<Job />} />
                
                <Route path="/JobDetails" element={<JobDetails />} />
                
                <Route path="/Jobs" element={<Jobs />} />
                
                <Route path="/JobsBoard" element={<JobsBoard />} />
                
                <Route path="/JobsBoardMarketing" element={<JobsBoardMarketing />} />
                
                <Route path="/JoinUs" element={<JoinUs />} />
                
                <Route path="/ManageOrgSubscription" element={<ManageOrgSubscription />} />
                
                <Route path="/ManageOrganisation" element={<ManageOrganisation />} />
                
                <Route path="/MasterclassDetails" element={<MasterclassDetails />} />
                
                <Route path="/MemberAccessRequired" element={<MemberAccessRequired />} />
                
                <Route path="/MemberBenefits" element={<MemberBenefits />} />
                
                <Route path="/MemberMasterclasses" element={<MemberMasterclasses />} />
                
                <Route path="/Membership" element={<Membership />} />
                
                <Route path="/MembershipPlans" element={<MembershipPlans />} />
                
                <Route path="/MembershipTiers" element={<MembershipTiers />} />
                
                <Route path="/MyCertificates" element={<MyCertificates />} />
                
                <Route path="/MyCreditHistory" element={<MyCreditHistory />} />
                
                <Route path="/MyMasterclassBookings" element={<MyMasterclassBookings />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/News" element={<News />} />
                
                <Route path="/NotFound" element={<NotFound />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/OrgAnalytics" element={<OrgAnalytics />} />
                
                <Route path="/OrgInvoices" element={<OrgInvoices />} />
                
                <Route path="/OrgJobs" element={<OrgJobs />} />
                
                <Route path="/OrgMembers" element={<OrgMembers />} />
                
                <Route path="/OrgPayment" element={<OrgPayment />} />
                
                <Route path="/OrgProfile" element={<OrgProfile />} />
                
                <Route path="/Organisation" element={<Organisation />} />
                
                <Route path="/OrganisationMembership" element={<OrganisationMembership />} />
                
                <Route path="/PortalMembershipTiers" element={<PortalMembershipTiers />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Referral" element={<Referral />} />
                
                <Route path="/RefresherCourses" element={<RefresherCourses />} />
                
                <Route path="/RegisteredOrganisation" element={<RegisteredOrganisation />} />
                
                <Route path="/RequestOrgPayment" element={<RequestOrgPayment />} />
                
                <Route path="/ResearchAndAdvocacy" element={<ResearchAndAdvocacy />} />
                
                <Route path="/SignpostingService" element={<SignpostingService />} />
                
                <Route path="/SpecialistCourses" element={<SpecialistCourses />} />
                
                <Route path="/SupervisionServices" element={<SupervisionServices />} />
                
                <Route path="/SupervisionServicesMarketing" element={<SupervisionServicesMarketing />} />
                
                
                <Route path="/Survey" element={<Survey />} />
                
                <Route path="/SurveyResponses" element={<SurveyResponses />} />
                
                <Route path="/Team" element={<Team />} />
                
                <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                
                <Route path="/Training" element={<Training />} />
                
                <Route path="/TrainingCourseDetails" element={<TrainingCourseDetails />} />
                
                <Route path="/TrusteeElections" element={<TrusteeElections />} />
                
                <Route path="/VerifyCredential" element={<VerifyCredential />} />
                
                <Route path="/WhyJoinUs" element={<WhyJoinUs />} />
                
                <Route path="/YourVoice" element={<YourVoice />} />
                
                <Route path="/about" element={<about />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
