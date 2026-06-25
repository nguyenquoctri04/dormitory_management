import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';
import DangerButton from '../../components/ui/DangerButton';


interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  studentCode: string;
}

export default function StudentProfile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    studentCode: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile(token!);
      setProfile(data);
      setEditFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender || 'MALE',
        studentCode: data.studentCode || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateStudentProfile(token!, editFormData);
      setIsEditing(false);
      await fetchProfile();
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      await api.changePassword(token!, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      alert('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Change password error:', error);
      alert('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải hồ sơ của bạn...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 animate-in fade-in duration-700">
      <header className="border-b border-slate-100 pb-8 mt-4">
        <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hệ thống sinh viên</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Hồ sơ <span className="text-indigo-600">Cá nhân.</span>
        </h1>
        <p className="mt-3 text-base text-slate-500 font-medium">
            Quản lý thông tin định danh và cài đặt bảo mật cho tài khoản của bạn.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
        {/* Left column: Profile Summary */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-50 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 -z-10"></div>
            
            <div className="relative inline-block mt-4">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl text-indigo-600 font-black border-4 border-white overflow-hidden">
                {profile?.fullName ? profile.fullName.charAt(0) : user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center text-white text-xs shadow-lg">
                ✓
              </div>
            </div>

            <div className="mt-8 space-y-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {profile?.fullName || 'N/A'}
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                        {user?.role || 'Sinh viên'}
                    </span>
                </div>
                <p className="text-slate-400 text-xs font-bold font-mono bg-slate-50 py-2 rounded-xl inline-block px-4">
                    {user?.email}
                </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-3">
              <Button 
                onClick={() => { setIsEditing(true); setIsChangingPassword(false); }}
                className="w-full bg-slate-800 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all"
              >
                Sửa hồ sơ
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setIsChangingPassword(true); setIsEditing(false); }}
                className="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-slate-800 border-slate-200 hover:bg-slate-50"
              >
                Đổi mật khẩu
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="relative">
                <h4 className="text-lg font-black mb-2">Bảo mật</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                    "Giữ bí mật thông tin tài khoản để đảm bảo an toàn dữ liệu của bạn."
                </p>
             </div>
          </div>
        </div>

        {/* Right column: Details / Forms */}
        <div className="lg:col-span-8">
          {(!isEditing && !isChangingPassword) && (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-10 border border-slate-50 min-h-[500px]">
               <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
                        📄
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết hồ sơ</h3>
               </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Họ và tên</p>
                  <p className="text-xl text-slate-800 font-bold tracking-tight border-b border-slate-50 pb-1">{profile?.fullName || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Giới tính</p>
                  <p className="text-xl text-slate-800 font-bold tracking-tight border-b border-slate-50 pb-1">{profile?.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Liên hệ</p>
                  <p className="text-xl text-slate-800 font-bold tracking-tight border-b border-slate-50 pb-1">{profile?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ngày sinh</p>
                  <p className="text-xl text-slate-800 font-bold tracking-tight border-b border-slate-50 pb-1">
                    {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div className="sm:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Mã sinh viên (MSSV)</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                        {user?.email?.split('@')[0] || profile?.studentCode || 'N/A'}
                    </p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-50 animate-in slide-in-from-right-10 duration-500">
               <h3 className="text-2xl font-black text-slate-900 mb-10">Cập nhật hồ sơ</h3>
               <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ & Tên</label>
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Giới tính</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Điện thoại</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày sinh</label>
                    <input
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-8 border-t border-slate-50">
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all"
                  >
                    Lưu hồ sơ
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isChangingPassword && (
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-50 animate-in slide-in-from-bottom-10 duration-500">
               <h3 className="text-2xl font-black text-slate-900 mb-10">Đổi mật khẩu</h3>
               <form onSubmit={handleChangePassword} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu cũ</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-slate-500/5 focus:border-slate-800 outline-none transition-all font-bold"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold"
                      placeholder="Tối thiểu 6 ký tự"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold"
                      placeholder="Phải trùng khớp"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-8 border-t border-slate-50">
                  <Button
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg"
                  >
                    Xác nhận đổi
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Quay lại
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
