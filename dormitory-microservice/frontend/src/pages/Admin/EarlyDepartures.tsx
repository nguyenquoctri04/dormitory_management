import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface EarlyDepartureRequest {
  id: string;
  stayId: string;
  studentId: string;
  reason: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  stay: {
    room: {
      roomNumber: string;
    };
  };
}

export default function AdminEarlyDepartures() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<EarlyDepartureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getEarlyDepartureRequests(token!);
      setRequests(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu rời sớm này?')) return;
    try {
      await api.approveEarlyDeparture(token!, id);
      alert('Đã duyệt yêu cầu thành công.');
      await fetchRequests();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Duyệt thất bại.');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) return;
    try {
      await api.rejectEarlyDeparture(token!, id);
      alert('Đã từ chối yêu cầu.');
      await fetchRequests();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Từ chối thất bại.');
    }
  };

  if (loading) return <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase tracking-widest">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">🏃‍♂️ Quản lý rời sớm</h1>
          <p className="mt-2 text-lg text-gray-500 font-medium">Phê duyệt các yêu cầu kết thúc cư trú trước thời hạn</p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sinh viên & Phòng</th>
              <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lý do</th>
              <th className="px-10 py-6 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
              <th className="px-10 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center text-slate-300 italic font-medium">
                  <div className="text-5xl mb-6 opacity-30">📋</div>
                  Hiện không có yêu cầu nào
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition truncate group border-b border-slate-50">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-lg text-slate-800 leading-tight">
                        Phòng {req.stay?.room?.roomNumber || 'N/A'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>MSSV: #{req.studentId.slice(-6).toUpperCase()}</span>
                        <span className="text-slate-200">|</span>
                        <span>{new Date(req.requestDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm text-slate-500 font-medium italic">
                      "{req.reason || 'Không có lý do cụ thể'}"
                    </p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        req.status === 'APPROVED' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : req.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {req.status === 'APPROVED' ? '● Đã duyệt' : req.status === 'REJECTED' ? '● Từ chối' : '● Chờ duyệt'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => handleReject(req.id)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          Từ chối
                        </Button>
                        <Button
                          onClick={() => handleApprove(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
                        >
                          Phê duyệt
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-tighter">
                        {req.status === 'APPROVED' ? 'Đã duyệt xong' : 'Đã từ chối'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
