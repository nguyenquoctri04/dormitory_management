import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Stay {
  id: string;
  studentId: string;
  roomId: string;
  room?: {
    roomNumber: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  registrationDate?: string;
}


export default function StudentStays() {
  const { token, user } = useAuth();
  const [stays, setStays] = useState<Stay[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    try {
      setLoading(true);
      const [stayRes, profileRes] = await Promise.all([
        api.getMyStays(token!),
        api.getStudentProfile(token!)
      ]);

      setStays(Array.isArray(stayRes) ? stayRes : (stayRes.data || []));
      setProfile(profileRes.id ? profileRes : (profileRes.data || null));
    } catch (error) {
      console.error('Failed to fetch stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const [departureReason, setDepartureReason] = useState('');
  const [showDepartureModal, setShowDepartureModal] = useState<string | null>(null);

  const handleEarlyDeparture = async () => {
    if (!showDepartureModal) return;
    
    try {
      await api.requestEarlyDeparture(token!, { 
        stay_id: showDepartureModal,
        reason: departureReason 
      });
      alert('Yêu cầu rời sớm đã được gửi thành công. Vui lòng chờ quản trị viên phê duyệt.');
      setShowDepartureModal(null);
      setDepartureReason('');
      fetchStays(); // Refresh data
    } catch (error: any) {
      console.error('Failed to request early departure:', error);
      alert(error.message || 'Gửi yêu cầu thất bại.');
    }
  };


  const activeStays = stays.filter((s) => s.status === 'ACTIVE');
  const pastStays = stays.filter((s) => s.status !== 'ACTIVE');

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'Đang ở', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'ENDED':
        return { text: 'Đã kết thúc', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'LEFT_EARLY':
        return { text: 'Rời sớm', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      default:
        return { text: status, color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const studentCodeFromEmail = user?.email?.split('@')[0];

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">🏠 Thông tin cư trú</h1>
        <p className="mt-2 text-lg text-gray-500 font-medium">Theo dõi lịch sử và trạng thái lưu trú tại ký túc xá</p>
      </header>

      {/* Current Residency */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Thông tin cư trú hiện tại</h2>
          </div>
          {activeStays.length > 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">
                Đang cư trú
            </span>
          )}
        </div>

        {activeStays.length === 0 ? (
          <div className="bg-white rounded-2xl border-4 border-dashed border-slate-50 p-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
              🏠
            </div>
            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-tight">Hiện chưa có thông tin</h3>
            <p className="text-slate-400 mt-1 text-sm font-medium">Bạn chưa đăng ký phòng hoặc yêu cầu chưa được duyệt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeStays.map(stay => (
              <div key={stay.id} className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden group transition-all hover:shadow-2xl">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div>
                        <span className="font-bold text-sm tracking-wider uppercase block leading-none">Phòng đang ở</span>
                        <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-0.5 block">Mã: {stay.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-tighter border border-white/30 backdrop-blur-sm">
                          ● Đang cư trú
                      </span>
                    </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Room Info */}
                    <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-50 pb-6 lg:pb-0 lg:pr-8 space-y-5">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số phòng</p>
                            <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
                              {stay.room?.roomNumber || stay.roomId}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Học kỳ</p>
                              <p className="text-sm font-bold text-slate-700">Kỳ {(stay as any).semester || '1'}</p>
                          </div>
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Năm học</p>
                              <p className="text-sm font-bold text-slate-700">{(stay as any).academicYear || '2024-2025'}</p>
                          </div>
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày vào</p>
                              <p className="text-sm font-bold text-slate-700">{new Date(stay.startDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dự kiến kết thúc</p>
                              <p className="text-sm font-bold text-slate-700">{stay.endDate ? new Date(stay.endDate).toLocaleDateString('vi-VN') : '---'}</p>
                          </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin cư trú sinh viên</p>
                          
                          <div className="flex flex-wrap items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-100 uppercase">
                                {profile?.fullName?.charAt(0) || '👤'}
                              </div>
                              <div className="flex-1 min-w-[200px]">
                                <h4 className="text-lg font-bold text-slate-800">
                                  {profile?.fullName || <span className="text-xs font-medium italic text-slate-400">Chưa cập nhật họ tên</span>}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
                                  <div className="text-xs font-bold text-slate-500">
                                    MSSV: <span className="text-slate-700 ml-1">
                                      {studentCodeFromEmail || profile?.studentCode || <span className="text-[10px] font-medium italic text-slate-400">Cần cập nhật trong hồ sơ</span>}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-500">
                                    Email: <span className="text-slate-700 ml-1">
                                      {user?.email || profile?.email || <span className="text-[10px] font-medium italic text-slate-400">Chưa cập nhật</span>}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-500">
                                    SĐT: <span className="text-slate-700 ml-1">
                                      {profile?.phone || <span className="text-[10px] font-medium italic text-slate-400">Cần cập nhật</span>}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-500">
                                    Giới tính: <span className="text-slate-700 ml-1">
                                      {profile?.gender ? (profile.gender === 'FEMALE' ? 'Nữ' : 'Nam') : <span className="text-[10px] font-medium italic text-slate-400">Chưa có</span>}
                                    </span>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <p className="text-[10px] font-medium text-slate-400 italic">
                      * Kiểm tra kỹ thông tin. Liên hệ BQL nếu có sai sót.
                    </p>
                    <Button
                        onClick={() => setShowDepartureModal(stay.id)}
                        className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
                    >
                        Yêu cầu rời sớm
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Departure Modal */}
      {showDepartureModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Lý do rời sớm</h3>
              <p className="text-slate-500 text-sm mb-6">Vui lòng cung cấp lý do bạn muốn rời ký túc xá trước thời hạn.</p>
              
              <textarea
                value={departureReason}
                onChange={(e) => setDepartureReason(e.target.value)}
                placeholder="Nhập lý do tại đây..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all min-h-[120px]"
              />

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="ghost"
                  onClick={() => { setShowDepartureModal(null); setDepartureReason(''); }}
                  className="flex-1 bg-slate-100 text-slate-800 py-3 rounded-2xl font-bold hover:bg-slate-200 transition"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleEarlyDeparture}
                  disabled={!departureReason.trim()}
                  className="flex-[2] bg-rose-600 text-white py-3 rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  Xác nhận gửi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Residency */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider ml-1">Lịch sử lưu trú</h2>
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Mã lưu trú</th>
                  <th className="px-8 py-6 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Phòng</th>
                  <th className="px-8 py-6 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Thời gian</th>
                  <th className="px-8 py-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pastStays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic font-medium">Chưa có lịch sử lưu trú</td>
                  </tr>
                ) : (
                  pastStays.map((stay) => {
                    const status = getStatusDisplay(stay.status);
                    return (
                      <tr key={stay.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6 font-mono text-xs text-slate-400 group-hover:text-emerald-600 transition-colors font-bold">
                          #{stay.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-8 py-6 font-black text-slate-700">Phòng {stay.room?.roomNumber || stay.roomId}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-600">
                                {new Date(stay.startDate).toLocaleDateString('vi-VN')} - {stay.endDate ? new Date(stay.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
