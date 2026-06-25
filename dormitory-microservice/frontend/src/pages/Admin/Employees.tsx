import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEmployees() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers(token);
      setUsers(res.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.createStaff(token, formData);
      setFormData({ email: '', password: '' });
      setShowForm(false);
      fetchUsers();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.updateUserStatus(token, user.id.toString(), newStatus);
      fetchUsers();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateUserRole(token, userId.toString(), newRole);
      fetchUsers();
    } catch (error) {
      console.error('Update role error:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.deleteUser(token, id.toString());
        fetchUsers();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-gray-500 font-medium">Đang tải danh sách nhân viên...</p>
    </div>
  );

  // Chỉ lấy role STAFF hoặc ADMIN (trừ bản thân) để quản lý
  const employees = users.filter(u => u.role === 'STAFF' || (u.role === 'ADMIN' && u.id !== currentUser?.id));

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">👥 Nhân viên & Phân quyền</h1>
          <p className="mt-2 text-lg text-gray-500">Cấp quyền, quản lý tài khoản và giám sát nhân sự hệ thống</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2`}
        >
          {showForm ? '✖ Đóng form' : '👤 Tạo nhân viên mới'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 ring-4 ring-indigo-50/50 max-w-2xl mx-auto animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">🆕 Cấp tài khoản nhân viên</h2>
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium text-sm">
              ⚠️ {errorMessage}
            </div>
          )}
          <form onSubmit={handleCreateStaff} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Email</label>
                <input
                  type="email"
                  placeholder="nhanvien@dorm.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-medium bg-gray-50/50"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
            >
              🚀 Tạo tài khoản nhân viên
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <h3 className="font-bold text-xl">Danh sách nhân sự</h3>
          <span className="bg-indigo-500/20 text-indigo-300 px-4 py-1 rounded-full text-sm font-bold border border-indigo-500/30">
            {employees.length} người dùng
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email & Nhân sự</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày tạo</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic font-medium">
                    <div className="text-4xl mb-4">📭</div>
                    Chưa có nhân viên
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                          emp.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-slate-500'
                        }`}>
                          {emp.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        emp.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {emp.role === 'ADMIN' ? '🛡️ Quản trị viên' : '👥 Nhân viên'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block group/select">
                        <select 
                          value={emp.status}
                          onChange={() => handleStatusToggle(emp)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border focus:ring-2 focus:ring-emerald-200 outline-none ${
                            emp.status === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'
                          }`}
                          title="Click để chọn trạng thái"
                        >
                          <option value="ACTIVE">✅ Đang làm việc</option>
                          <option value="INACTIVE">🚫 Tạm ngưng</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-40 group-hover/select:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {new Date(emp.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right space-x-3 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => handleDeleteUser(emp.id)} 
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Xóa vĩnh viễn"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
