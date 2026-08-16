/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManagePools from './pages/admin/ManagePools';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageUsers from './pages/admin/ManageUsers';
import AdminApprovals from './pages/admin/Approvals';
import AdminPayments from './pages/admin/Payments';
import AttendancePage from './pages/Attendance';
import StudentSchedules from './pages/student/StudentSchedules';
import MySchedules from './pages/student/MySchedules';
import MyPayments from './pages/student/MyPayments';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  if (roles) {
    const userRoles = user.Role ? user.Role.split(',').map((r: string) => r.trim()) : [];
    const hasRole = roles.some(role => userRoles.includes(role));
    if (!hasRole) return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function RoleBasedHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  const userRoles = user.Role ? user.Role.split(',').map((r: string) => r.trim()) : [];
  
  if (userRoles.includes('Admin')) return <AdminDashboard />;
  if (userRoles.includes('Teacher')) return <AttendancePage />;
  if (userRoles.includes('Student')) return <StudentSchedules />;
  
  return <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<RoleBasedHome />} />
          
          {/* Admin Routes */}
          <Route path="/pools" element={<ProtectedRoute roles={['Admin']}><ManagePools /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['Admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute roles={['Admin', 'Teacher']}><ManageSchedules /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute roles={['Admin']}><AdminApprovals /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute roles={['Admin']}><AdminPayments /></ProtectedRoute>} />
          
          {/* Shared Admin/Teacher */}
          <Route path="/attendance" element={<ProtectedRoute roles={['Admin', 'Teacher']}><AttendancePage /></ProtectedRoute>} />
          
          {/* Student Routes */}
          <Route path="/my-schedules" element={<ProtectedRoute roles={['Student']}><MySchedules /></ProtectedRoute>} />
          <Route path="/my-payments" element={<ProtectedRoute roles={['Student']}><MyPayments /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

