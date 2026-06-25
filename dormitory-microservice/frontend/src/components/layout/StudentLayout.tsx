import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../ui/Button';
import DangerButton from '../ui/DangerButton';
import DormitoryRules from './DormitoryRules';


export default function StudentLayout() {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const profile = await api.getStudentProfile(token);
          if (profile && profile.fullName) {
            setStudentName(profile.fullName);
          }
        } catch (error) {
          console.error('Failed to fetch student profile:', error);
        }
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfilePage = window.location.pathname.includes('/profile');

  if (user?.status === 'INACTIVE' && !isProfilePage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100 ring-8 ring-slate-50 animate-in zoom-in duration-300">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Truy cập bị hạn chế</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Tài khoản của bạn đang trong trạng thái <span className="text-rose-600 font-bold">Tạm ngưng</span>. <br/>
            Bạn chỉ có thể xem hồ sơ sinh viên. Các chức năng khác hiện <span className="text-rose-600 font-bold">không thể truy cập</span>.
          </p>
          <div className="flex gap-3">
            <Button 
                onClick={() => navigate('/student/profile')} 
                className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 transition shadow-lg shadow-cyan-100"
            >
                Xem hồ sơ
            </Button>
            <DangerButton 
                onClick={handleLogout} 
                className="flex-1 py-3 rounded-xl font-bold transition"
            >
                Đăng xuất
            </DangerButton>

          </div>
        </div>
        <DormitoryRules />
      </div>
    );
  }

  const menuItems = [
    { label: 'Đăng ký phòng', href: '/student/rooms' },
    { label: 'Lịch sử đăng ký', href: '/student/registrations' },
    { label: 'Thông tin cư trú sinh viên', href: '/student/stays' },
    { label: 'Gửi khiếu nại', href: '/student/complaints' },
    { label: 'Xem hóa đơn điện nước', href: '/student/utilities' },
    { label: 'Xem lịch sử thanh toán', href: '/student/payments' },
    { label: 'Hồ sơ sinh viên', href: '/student/profile' },
  ].filter(item => {
    if (user?.status === 'INACTIVE') {
      return item.href.includes('/profile');
    }
    return true;
  });

  const displayName = studentName || user?.email || 'Sinh viên';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative flex flex-col">
        <div className="p-6 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-cyan-100">
          <h1 className="text-xl font-bold text-cyan-600 truncate">
            Chào {studentName ? 'sinh viên' : ''}
          </h1>
          <p className="text-sm text-gray-700 font-semibold truncate mt-1">
            {displayName}
          </p>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <DangerButton
            onClick={handleLogout}
            className="w-full py-2 rounded-lg cursor-pointer transition"
          >
            Đăng xuất
          </DangerButton>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
      <DormitoryRules />
    </div>
  );
}
