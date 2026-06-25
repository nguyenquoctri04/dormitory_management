import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DangerButton from '../ui/DangerButton';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Quản lý phòng', icon: '🏢', path: '/admin/rooms' },
    { text: 'Quản lý điện nước', icon: '⚡', path: '/admin/utilities' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <h1 className="text-2xl font-bold text-red-600">Admin</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý ký túc xá</p>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-semibold group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span>{item.text}</span>
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
    </div>
  );
}
