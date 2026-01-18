import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import all portal pages
import AdminDashboard from "./AdminDashboard";
import AdminSupport from "./AdminSupport";
import ApplicationProcessing from "./ApplicationProcessing";
import CommunityEventDetails from "./CommunityEventDetails";
import CommunityEvents from "./CommunityEvents";
import CourseDetails from "./CourseDetails";
import CPDTraining from "./CPDTraining";
import Dashboard from "./Dashboard";
import EditCourse from "./EditCourse";
import EditEvent from "./EditEvent";
import EditJob from "./EditJob";
import EditSurvey from "./EditSurvey";
import EditUser from "./EditUser";
import EventRegistrationSuccess from "./EventRegistrationSuccess";
import Forum from "./Forum";
import ForumPostDetails from "./ForumPostDetails";
import Job from "./Job";
import JobDetails from "./JobDetails";
import JobsBoard from "./JobsBoard";
import ManageOrganisation from "./ManageOrganisation";
import ManageOrgSubscription from "./ManageOrgSubscription";
import MasterclassDetails from "./MasterclassDetails";
import MemberMasterclasses from "./MemberMasterclasses";
import MyCertificates from "./MyCertificates";
import MyCreditHistory from "./MyCreditHistory";
import MyMasterclassBookings from "./MyMasterclassBookings";
import MyProfile from "./MyProfile";
import News from "./News";
import Onboarding from "./Onboarding";
import OrgAnalytics from "./OrgAnalytics";
import Organisation from "./Organisation";
import OrganisationMembership from "./OrganisationMembership";
import OrgInvoices from "./OrgInvoices";
import OrgJobs from "./OrgJobs";
import OrgMembers from "./OrgMembers";
import OrgPayment from "./OrgPayment";
import OrgProfile from "./OrgProfile";
import PortalMembershipTiers from "./PortalMembershipTiers";
import RequestOrgPayment from "./RequestOrgPayment";
import SupervisionServices from "./SupervisionServices";
import Support from "./Support";
import Survey from "./Survey";
import SurveyResponses from "./SurveyResponses";
import TrusteeElections from "./TrusteeElections";
import YourVoice from "./YourVoice";
import Login from "./Login";
import VerifyCode from "./VerifyCode";
import SetPassword from "./SetPassword";

export default function Pages() {
    const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.ifs-safeguarding.co.uk';
    const adminHost = (() => {
        try {
            return new URL(adminUrl).host;
        } catch (error) {
            return 'admin.ifs-safeguarding.co.uk';
        }
    })();
    const isAdminDomain = typeof window !== 'undefined' && window.location.host === adminHost;

    return (
        <Router>
            <Routes>
                {/* Auth routes - no layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/set-password" element={<SetPassword />} />

                {/* All other routes with layout */}
                <Route path="/*" element={
                    <Layout currentPageName="Portal">
                        <Routes>
                            {/* Default route */}
                            <Route path="/" element={isAdminDomain ? <AdminDashboard /> : <Dashboard />} />

                            {/* Portal routes - lowercase to match createPageUrl */}
                            <Route path="/admindashboard" element={<AdminDashboard />} />
                            <Route path="/adminsupport" element={<AdminSupport />} />
                            <Route path="/applicationprocessing" element={<ApplicationProcessing />} />
                            <Route path="/communityeventdetails" element={<CommunityEventDetails />} />
                            <Route path="/communityevents" element={<CommunityEvents />} />
                            <Route path="/coursedetails" element={<CourseDetails />} />
                            <Route path="/cpdtraining" element={<CPDTraining />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/editcourse" element={<EditCourse />} />
                            <Route path="/editevent" element={<EditEvent />} />
                            <Route path="/editjob" element={<EditJob />} />
                            <Route path="/editsurvey" element={<EditSurvey />} />
                            <Route path="/edituser" element={<EditUser />} />
                            <Route path="/eventregistrationsuccess" element={<EventRegistrationSuccess />} />
                            <Route path="/forum" element={<Forum />} />
                            <Route path="/forumpostdetails" element={<ForumPostDetails />} />
                            <Route path="/job" element={<Job />} />
                            <Route path="/jobdetails" element={<JobDetails />} />
                            <Route path="/jobsboard" element={<JobsBoard />} />
                            <Route path="/manageorganisation" element={<ManageOrganisation />} />
                            <Route path="/manageorgsubscription" element={<ManageOrgSubscription />} />
                            <Route path="/masterclassdetails" element={<MasterclassDetails />} />
                            <Route path="/membermasterclasses" element={<MemberMasterclasses />} />
                            <Route path="/mycertificates" element={<MyCertificates />} />
                            <Route path="/mycredithistory" element={<MyCreditHistory />} />
                            <Route path="/mymasterclassbookings" element={<MyMasterclassBookings />} />
                            <Route path="/myprofile" element={<MyProfile />} />
                            <Route path="/news" element={<News />} />
                            <Route path="/onboarding" element={<Onboarding />} />
                            <Route path="/organalytics" element={<OrgAnalytics />} />
                            <Route path="/organisation" element={<Organisation />} />
                            <Route path="/organisationmembership" element={<OrganisationMembership />} />
                            <Route path="/orginvoices" element={<OrgInvoices />} />
                            <Route path="/orgjobs" element={<OrgJobs />} />
                            <Route path="/orgmembers" element={<OrgMembers />} />
                            <Route path="/orgpayment" element={<OrgPayment />} />
                            <Route path="/orgprofile" element={<OrgProfile />} />
                            <Route path="/portalmembershiptiers" element={<PortalMembershipTiers />} />
                            <Route path="/requestorgpayment" element={<RequestOrgPayment />} />
                            <Route path="/supervisionservices" element={<SupervisionServices />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/survey" element={<Survey />} />
                            <Route path="/surveyresponses" element={<SurveyResponses />} />
                            <Route path="/trusteeelections" element={<TrusteeElections />} />
                            <Route path="/yourvoice" element={<YourVoice />} />

                            {/* 404 catch-all */}
                            <Route path="*" element={<Dashboard />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </Router>
    );
}
