import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import DangerButton from '../ui/DangerButton';


export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfilePage = false;

  if (user?.status === 'INACTIVE' && !isProfilePage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100 ring-8 ring-slate-50 animate-in zoom-in duration-300">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Truy cập bị hạn chế</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Tài khoản của bạn đang trong trạng thái <span className="text-rose-600 font-bold">Tạm ngưng</span>. <br/>
            Bạn chỉ có thể xem hồ sơ cá nhân. Các chức năng khác hiện <span className="text-rose-600 font-bold">không thể truy cập</span>.
          </p>
          <div className="flex gap-3">
            <Button 
                onClick={() => navigate('/staff/profile')} 
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
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
      </div>
    );
  }

  const menuItems = [
    { label: 'Quản lý đăng ký phòng', href: '/staff/registrations' },
    { label: 'Quản lý rời sớm', href: '/staff/early-departures' },
    { label: 'Quản lý khiếu nại', href: '/staff/complaints' },
    { label: 'Quản lý điện nước', href: '/staff/utilities' },
    { label: 'Quản lý cư trú', href: '/staff/stays' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-6 border-b border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <h1 className="text-2xl font-bold text-green-600">Nhân viên</h1>
          <p className="text-sm text-gray-600 mt-1">Hệ thống quản lý</p>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition cursor-pointer"
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
    </div>
  );
}
