import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Schedule from './pages/Schedule';
import CampusMap from './pages/CampusMap';
import Announcements from './pages/Announcements';
import ChatAssistant from './pages/ChatAssistant';
import ProfessorClasses from './pages/ProfessorClasses';
import AvailableCourses from './pages/AvailableCourses';
import MarkAttendance from './pages/MarkAttendance';
import Grades from './pages/Grades';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import AdminReports from './pages/AdminReports';
import Settings from './pages/Settings';
import Library from './pages/Library';
import AdminAnnouncements from './pages/AdminAnnouncements';
import ProfessorAssignments from './pages/ProfessorAssignments';
import AppLayout from './components/AppLayout';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<AvailableCourses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="map" element={<CampusMap />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="chat" element={<ChatAssistant />} />
        <Route path="my_classes" element={<ProfessorClasses />} />
        <Route path="classes" element={<ProfessorClasses />} />
        <Route path="mark_att" element={<MarkAttendance />} />
        <Route path="grades" element={<Grades />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="course-management" element={<AdminCourses />} />
        <Route path="professor-assignments" element={<ProfessorAssignments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="library" element={<Library />} />
        <Route path="announcements_admin" element={<AdminAnnouncements />} />
        <Route path="*" element={<div className="page-body"><h2>Coming Soon</h2><p>This view is not yet implemented.</p></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}



export default App;
