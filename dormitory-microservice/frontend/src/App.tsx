import { Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider } from './components/providers/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import AdminStudents from './pages/Admin/Students';
import AdminRooms from './pages/Admin/Rooms';
import AdminPayments from './pages/Admin/Payments'
import AdminRegistrations from './pages/Admin/Registrations';
import AdminUtilities from './pages/Admin/Utilities';
import AdminComplaints from './pages/Admin/Complaints';
import StudentProfile from './pages/Student/Profile';
import StudentRooms from './pages/Student/Rooms';
import StudentPayments from './pages/Student/Payments';
import StudentStays from './pages/Student/Stays';
import StudentUtilities from './pages/Student/Utilities';
import StudentComplaints from './pages/Student/Complaints';

function App() {
  return (
    <AuthProvider>
      <Routes>


          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="utilities" element={<AdminUtilities />} />
            <Route path="complaints" element={<AdminComplaints />} />
          </Route>
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="rooms" element={<StudentRooms />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="stays" element={<StudentStays />} />
            <Route path="utilities" element={<StudentUtilities />} />
            <Route path="complaints" element={<StudentComplaints />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
  );
}


export default App;
