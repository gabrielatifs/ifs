import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Admin-only pages
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import VerifyCode from "./VerifyCode";
import SetPassword from "./SetPassword";

export default function Pages() {
    return (
        <Router>
            <Routes>
                {/* Auth routes - no layout */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/set-password" element={<SetPassword />} />

                {/* Admin routes */}
                <Route path="/admindashboard/*" element={
                    <Layout currentPageName="AdminDashboard">
                        <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="*" element={<AdminDashboard />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </Router>
    );
}
