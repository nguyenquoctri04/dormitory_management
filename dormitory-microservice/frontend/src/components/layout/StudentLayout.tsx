import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function StudentLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Hồ sơ', href: '/student/profile' },
    { label: 'Phòng ở', href: '/student/rooms' },
    { label: 'Thanh toán', href: '/student/payments' },
    { label: 'Lịch sử ở', href: '/student/stays' },
    { label: 'Tiện ích', href: '/student/utilities' },
    { label: 'Khiếu nại', href: '/student/complaints' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-cyan-100">
          <h1 className="text-2xl font-bold text-cyan-600">Sinh viên</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý thông tin cá nhân</p>
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
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg cursor-pointer transition"
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
