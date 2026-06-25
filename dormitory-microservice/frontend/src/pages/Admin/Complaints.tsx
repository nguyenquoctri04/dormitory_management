import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Complaint {
  id: string;
  studentId: string;
  roomId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  staff_response?: string;
  staffResponse?: string;
}

export default function AdminComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.getComplaints(token!);
      setComplaints(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');

  const handleResolve = async () => {
    if (!resolvingId) return;
    try {
      await api.updateComplaintStatus(token!, resolvingId, { status: 'RESOLVED', staff_response: response });
      setResolvingId(null);
      setResponse('');
      await fetchComplaints();
    } catch (error) {
      console.error('Failed to resolve complaint:', error);
    }
  };

  if (loading) return <div className="text-center py-20 font-black text-slate-300 animate-pulse">ĐANG TẢI DỮ LIỆU...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📠 Quản lý khiếu nại</h1>
          <p className="mt-2 text-lg text-gray-500 font-medium">Lắng nghe và phản hồi các vấn đề của sinh viên</p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.22em]">Nội dung</th>
              <th className="px-10 py-6 text-center text-xs font-black text-slate-400 uppercase tracking-[0.22em]">Phản hồi</th>
              <th className="px-10 py-6 text-center text-xs font-black text-slate-400 uppercase tracking-[0.22em]">Trạng thái</th>
              <th className="px-10 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-[0.22em]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center text-slate-300 italic font-medium">
                  <div className="text-5xl mb-6 opacity-30">✅</div>
                  Tất cả khiếu nại đã được xử lý
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50/50 transition group border-b border-slate-50">
                  <td className="px-10 py-8 cursor-pointer" onClick={() => setViewingComplaint(complaint)}>
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-lg text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{complaint.title}</span>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        <span>MSSV: #{complaint.studentId ? complaint.studentId.slice(-6).toUpperCase() : 'N/A'}</span>
                        <span className="text-slate-200">|</span>
                        <span>{new Date(complaint.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 italic">
                        "{complaint.description}"
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8 max-w-xs cursor-pointer" onClick={() => setViewingComplaint(complaint)}>
                    {(complaint.staff_response || complaint.staffResponse) ? (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-medium italic border border-emerald-100 line-clamp-2">
                            "{complaint.staff_response || complaint.staffResponse}"
                        </div>
                    ) : (
                        <span className="text-slate-300 text-xs italic ml-4">Chưa có phản hồi</span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        complaint.status === 'RESOLVED' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      {complaint.status === 'RESOLVED' ? '● Đã giải quyết' : '● Chờ xử lý'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setViewingComplaint(complaint)}
                            className="px-4 py-2 rounded-xl text-xs font-bold"
                        >
                            Xem chi tiết
                        </Button>
                        {complaint.status !== 'RESOLVED' && (
                            <Button
                                onClick={() => setResolvingId(complaint.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                Phản hồi
                            </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail View Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-10">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-3 ${
                        viewingComplaint.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                        {viewingComplaint.status === 'RESOLVED' ? 'ĐÃ GIẢI QUYẾT' : 'CHỜ XỬ LÝ'}
                    </span>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{viewingComplaint.title}</h3>
                  </div>
                  <button onClick={() => setViewingComplaint(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition text-slate-400 text-xl">✕</button>
               </div>

               <div className="space-y-6">
                  <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Nội dung khiếu nại:</span>
                     <p className="text-slate-700 font-medium leading-relaxed italic text-lg">
                        "{viewingComplaint.description}"
                     </p>
                  </div>

                  {(viewingComplaint.staff_response || viewingComplaint.staffResponse) && (
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">📢</div>
                            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Phản hồi của nhân viên:</span>
                        </div>
                        <p className="text-xl font-bold leading-relaxed tracking-tight">
                            {viewingComplaint.staff_response || viewingComplaint.staffResponse}
                        </p>
                    </div>
                  )}
               </div>

               <div className="mt-10 flex justify-end gap-3">
                  <Button onClick={() => setViewingComplaint(null)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition shadow-xl">
                      Đóng cửa sổ
                  </Button>
                  {viewingComplaint.status !== 'RESOLVED' && (
                      <Button onClick={() => { setViewingComplaint(null); setResolvingId(viewingComplaint.id); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100">
                          Phản hồi ngay
                      </Button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-12">
              <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Phản hồi khiếu nại</h3>
              <p className="text-slate-500 font-medium mb-8">Nội dung phản hồi này sẽ được gửi trực tiếp đến sinh viên.</p>
              
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Lời nhắn của bạn</label>
                <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="VD: Chúng tôi sẽ cử nhân viên kỹ thuật qua kiểm tra vào 2h chiều nay..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 min-h-[180px]"
                />
              </div>

              <div className="flex gap-4 mt-10">
                <Button 
                  variant="ghost"
                  onClick={() => {
                      setResolvingId(null);
                      setResponse('');
                  }}
                  className="flex-1 bg-slate-100 text-slate-800 py-4 rounded-2xl font-bold hover:bg-slate-200 transition"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handleResolve}
                  disabled={!response.trim()}
                  className="flex-[2] bg-indigo-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  Gửi phản hồi ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
