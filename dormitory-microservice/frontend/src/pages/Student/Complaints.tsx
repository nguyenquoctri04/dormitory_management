import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Stay {
  id: string;
  status: string;
}

export default function StudentComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '',
    room_id: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, staysRes] = await Promise.all([
        api.getMyComplaints(token!),
        api.getMyStays(token!)
      ]);
      setComplaints(complaintsRes.data || complaintsRes || []);
      const stayData = staysRes.data || staysRes || [];
      setStays(stayData);
      
      const activeStay = stayData.find((s: any) => s.status === 'ACTIVE');
      if (activeStay) {
        setFormData(prev => ({ ...prev, room_id: activeStay.roomId || activeStay.room_id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_id) {
      alert('Bạn cần đang ở tại một phòng để gửi khiếu nại.');
      return;
    }
    try {
      await api.submitComplaint(token!, formData);
      setShowForm(false);
      setFormData({ ...formData, title: '', description: '' });
      await fetchData();
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      alert('Gửi khiếu nại thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'Đã giải quyết';
      case 'PROCESSING': return 'Đang xử lý';
      case 'PENDING': return 'Chờ xử lý';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-500 shadow-emerald-100';
      case 'PROCESSING': return 'bg-blue-500 shadow-blue-100';
      case 'PENDING': return 'bg-amber-500 shadow-amber-100';
      default: return 'bg-slate-500 shadow-slate-100';
    }
  };

  const hasActiveResidency = stays.some((s: any) => s.status === 'ACTIVE');

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="h-16 w-16 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu khiếu nại...</p>
    </div>
  );

  if (!hasActiveResidency && complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-50 max-w-xl ring-12 ring-slate-50">
          <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 mx-auto mb-10 rotate-3">
             <span className="text-5xl text-white">🏢</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">Khu vực cư dân</h2>
          <p className="text-slate-500 font-medium leading-relaxed text-lg px-4">
            Tính năng gửi khiếu nại & góp ý chỉ dành cho sinh viên hiện đang nội trú hoặc đã từng nội trú tại Ký túc xá.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4">
            <Button 
                onClick={() => window.location.href = '/student/rooms'}
                className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-slate-200 active:scale-95"
            >
                Tìm phòng ngay
            </Button>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-4">Hotline hỗ trợ: 1900 6000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100">Kênh hỗ trợ</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phản hồi 24/7</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Gửi yêu cầu <span className="text-indigo-600">Giải quyết.</span>
          </h1>
          <p className="text-base text-slate-500 font-medium max-w-lg">
            Mọi ý kiến của bạn đều giúp nâng cao chất lượng dịch vụ.
          </p>
        </div>
        
        {hasActiveResidency && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-slate-900'} text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-3 h-fit`}
          >
            {showForm ? '✖ Đóng lại' : (
                <>
                    <span className="text-sm">➕</span>
                    <span>Tạo khiếu nại mới</span>
                </>
            )}
          </Button>
        )}
      </header>

      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-10 border border-slate-50 animate-in slide-in-from-top-10 duration-500 relative">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
             Chi tiết vấn đề
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phòng liên quan</label>
                    <select
                        value={formData.room_id}
                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                        required
                    >
                        <option value="">Chọn phòng của bạn</option>
                        {stays.map(stay => (
                            <option key={stay.id} value={(stay as any).roomId || (stay as any).room_id}>
                                Phòng {(stay as any).room?.roomNumber || (stay as any).roomId || (stay as any).room_id}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chủ đề</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="VD: Sự cố điện nước, An ninh..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                        required
                    />
                </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả chi tiết</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả cụ thể sự việc bạn đang gặp phải..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 min-h-[150px]"
                required
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-50 transition-all active:scale-95"
              >
                Gửi khiếu nại
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-xl font-black text-slate-800 ml-2 flex items-center gap-3">
            Lịch sử khiếu nại
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] text-slate-400">
                {complaints.length}
            </span>
        </h2>
        
        {complaints.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
             <p className="text-slate-300 text-lg font-bold italic">Chưa có dữ liệu khiếu nại.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-3xl shadow-lg border border-slate-50 overflow-hidden hover:border-indigo-100 transition-all">
                <div className="p-8 md:p-10">
                   <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-8">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                           <span className={`px-4 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(complaint.status)}`}>
                             {getStatusText(complaint.status)}
                           </span>
                           <span className="text-[10px] font-bold text-slate-300 uppercase">
                              #{complaint.id.toUpperCase().slice(-8)}
                           </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">
                           {complaint.title}
                        </h3>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-4 py-1">
                           "{complaint.description}"
                        </p>
                      </div>
                      
                      <div className="text-right whitespace-nowrap pt-1">
                         <span className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Ngày gửi</span>
                         <p className="text-base font-black text-slate-800">
                            {new Date(complaint.created_at || (complaint as any).createdAt).toLocaleDateString('vi-VN')}
                         </p>
                      </div>
                   </div>

                   {(complaint as any).staffResponse && (
                      <div className="mt-8 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden group/response">
                        <div className="relative flex gap-4">
                           <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0">
                              📢
                           </div>
                           <div className="space-y-2">
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Phản hồi từ Admin:</span>
                              <p className="text-base font-bold text-emerald-900 italic">
                                {(complaint as any).staffResponse}
                              </p>
                           </div>
                        </div>
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
