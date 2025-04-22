import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom';
import axios from 'axios';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import CoursesPage from './components/CoursesPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/Admindashboard';
import BuyCourses from './components/BuyCourses';
import NonAdminDashboard from './components/NonAdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import { AuthProvider } from './context/AuthContext';
import MyCourses from './components/MyCourses';
import ParentComponent from './components/ParentComponent';
import PurchasedCoursesPage from './components/PurchasedCoursesPage';
import SendRenewalNotificationPage from './components/SendRenewalNotificationPage';
import Modal from './components/Modal';
import CourseList from './components/CourseList';
import Admin from './components/Admin';
import UsersByCoursePage from './components/UsersByCoursePage';
import PurchasedUsers from './components/PurchasedUsers';
import AdminPurchasedUsers from './components/AdminPurchasedUsers';
import Chatbot from './components/Chatbot';
import ChatApp from './components/ChatApp';

import './App.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <AuthProvider>
            <Router>
                <MainContent user={user} />
            </Router>
        </AuthProvider>
    );
};

const MainContent = ({ user }) => {
    const location = useLocation();

    const isAuthenticated = !!user;
    const isAdminOrNonAdmin = user && (user.role === 'admin' || user.role === 'non-admin');

    const hideHeaderRoutes = ['/login', '/register'];
    const hideSidebarRoutes = ['/login', '/register', '/buy-courses', '/member-dashboard'];
    const shouldHideSidebar =
        hideSidebarRoutes.includes(location.pathname) ||
        location.pathname.startsWith('/my-courses/');

    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            {!hideHeaderRoutes.includes(location.pathname) && <Header />}
            <div className="app-container" style={{ display: 'flex' }}>
                {!shouldHideSidebar && <Sidebar />}
                <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="page-content" style={{ flex: 1, padding: '20px' }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={<Navigate to="/courses" />} />
                            <Route path="/courses" element={isAdminOrNonAdmin ? <CoursesPage /> : <Navigate to="/" />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/buy-courses" element={<BuyCourses />} />
                            <Route path="/non-admin-dashboard" element={<NonAdminDashboard />} />
                            <Route path="/chatbot" element={<Chatbot />} />
                            <Route path="/chatApp" element={<ChatApp />} />
                            <Route path="/member-dashboard" element={<MemberDashboard />} />
                            <Route path="/my-courses/:userId" element={<MyCourses />} />
                            <Route path="/PurchasedCoursesPage" element={<PurchasedCoursesPage />} />
                            <Route path="/SendRenewalNotificationPage" element={<SendRenewalNotificationPage />} />
                            <Route path="/Modal" element={<Modal />} />
                            <Route path="/Admin" element={<Admin />} />
                            <Route path="/CourseList" element={<CourseList />} />
                            <Route path="/ParentComponent" element={<ParentComponent />} />
                            <Route path="/UsersByCoursePage" element={<UsersByCoursePage />} />
                            <Route path="/courses/:courseId/purchasing" element={<PurchasedUsers />} />
                            <Route path="/AdminPurchasedUsers" element={<AdminPurchasedUsers />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default App;
