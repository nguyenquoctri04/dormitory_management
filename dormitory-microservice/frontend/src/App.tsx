import { Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider } from './components/providers/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import StaffLayout from './components/layout/StaffLayout';
import AdminStudents from './pages/Admin/Students';
import AdminRooms from './pages/Admin/Rooms';
import AdminEmployees from './pages/Admin/Employees';
import AdminPayments from './pages/Admin/Payments'
import AdminRegistrations from './pages/Admin/Registrations';
import AdminUtilities from './pages/Admin/Utilities';
import AdminComplaints from './pages/Admin/Complaints';
import AdminEarlyDepartures from './pages/Admin/EarlyDepartures';
import StudentProfile from './pages/Student/Profile';
import StudentRooms from './pages/Student/Rooms';
import StudentPayments from './pages/Student/Payments';
import StudentStays from './pages/Student/Stays';
import StudentUtilities from './pages/Student/Utilities';
import StudentRegistrations from './pages/Student/Registrations';
import StudentComplaints from './pages/Student/Complaints';
import StaffStays from './pages/Staff/Stays';
import PlaceholderPage from './pages/Placeholder';

function App() {
  return (
    <AuthProvider>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="rooms" replace />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="utilities" element={<AdminUtilities />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="early-departures" element={<AdminEarlyDepartures />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="rooms" element={<StudentRooms />} />
            <Route path="registrations" element={<StudentRegistrations />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="utilities" element={<StudentUtilities />} />
            <Route path="stays" element={<StudentStays />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute requiredRole="STAFF">
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="early-departures" replace />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="utilities" element={<AdminUtilities />} />
            <Route path="early-departures" element={<AdminEarlyDepartures />} />
            <Route path="stays" element={<StaffStays />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
  );
}


export default App;
