import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';
import DangerButton from '../../components/ui/DangerButton';


interface Registration {
  id: string;
  studentId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: string;
  status: string;
  rejectionReason: string;
}


export default function AdminRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionData, setRejectionData] = useState({ reason: '', otherText: '' });



  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const [regRes, studentRes, roomRes] = await Promise.all([
        api.getRegistrations(token!),
        api.getStudents(token!),
        api.getRooms(token!)
      ]);
      setRegistrations(regRes || []);
      setStudents(studentRes.students || studentRes || []);
      setRooms(roomRes.rooms || roomRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reg: Registration) => {
    try {
      // Approve in registration-service
      // This will publish registration.approved, which room-service listens to for Stay creation
      await api.approveRegistration(token!, reg.id, { room_id: reg.roomId });
      
      fetchRegistrations();
    } catch (error: any) {
      console.error('Failed to approve registration:', error);
      alert('Phê duyệt thất bại: ' + error.message);
    }
  };


  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      const finalReason = rejectionData.reason === 'Other' ? rejectionData.otherText : rejectionData.reason;
      await api.rejectRegistration(token!, rejectingId, { rejection_reason: finalReason });
      setRejectingId(null);
      setRejectionData({ reason: '', otherText: '' });
      fetchRegistrations();
    } catch (error) {
      console.error('Failed to reject registration:', error);
    }
  };


  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📝 Quản lý đăng ký phòng</h1>
          <p className="mt-2 text-lg text-gray-500 font-medium">Duyệt các yêu cầu lưu trú từ sinh viên</p>
        </div>
        <div className="bg-indigo-50 px-6 py-2 rounded-2xl border border-indigo-100">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
                {registrations.filter(r => r.status === 'PENDING').length} Yêu cầu mới
            </span>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Sinh viên</th>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Phòng</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lý do từ chối</th>
                <th className="px-8 py-5 text-right text-xs font-extrabold text-slate-400 uppercase tracking-widest">Hành động</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                    <div className="text-4xl mb-4 text-slate-200">📭</div>
                    Không có yêu cầu đăng ký nào
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const student = students.find(s => s.userId === reg.studentId);
                  const room = rooms.find(r => r.id === reg.roomId);
                  
                  return (
                      <tr key={reg.id} className="hover:bg-slate-50/50 transition truncate group border-b border-slate-50">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {student?.fullName ? student.fullName.charAt(0).toUpperCase() : '??'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">
                                      {student?.fullName || `SV: ${reg.studentId.slice(-6).toUpperCase()}`}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">MSSV: {student?.studentCode || student?.studentCardId || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-black text-sm">
                                {room?.roomNumber || 'Phòng chờ'}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">
                                    {reg.academicYear || (reg.startDate ? new Date(reg.startDate).getFullYear() : '2024-2025')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                    Học kỳ {reg.semester === 'summer' ? 'Hè' : (reg.semester || '1')}
                                </span>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                    reg.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                    reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                    reg.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                                    reg.status === 'WAITING_PAYMENT' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-amber-100 text-amber-700 border-amber-200'
                                }`}
                            >
                                {reg.status === 'COMPLETED' ? '● Đã nhận phòng' : 
                                 reg.status === 'APPROVED' ? '● Chờ nhận phòng' : 
                                 reg.status === 'REJECTED' ? '● Từ chối' : 
                                 reg.status === 'WAITING_PAYMENT' ? '● Chờ thanh toán' :
                                 '● Chờ duyệt'}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            {reg.status === 'REJECTED' ? (
                                <span className="text-xs text-rose-500 font-medium italic">
                                    {reg.rejectionReason || 'Không có lý do'}
                                </span>
                            ) : (
                                <span className="text-sm text-slate-300 font-bold ml-4">-</span>
                            )}
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap">

                            <div className="flex justify-end gap-2">
                                {reg.status === 'PENDING' ? (
                                    <>
                                        <Button
                                            onClick={() => handleApprove(reg)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                        >
                                            Duyệt
                                        </Button>
                                        <DangerButton
                                            onClick={() => setRejectingId(reg.id)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                                        >
                                            Từ chối
                                        </DangerButton>
                                    </>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-300 italic mr-2 self-center">Đã xử lý</span>
                                )}
                            </div>
                        </td>
                      </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Lý do từ chối</h3>
              <p className="text-slate-500 text-sm mb-6">Vui lòng chọn hoặc nhập lý do từ chối yêu cầu đăng ký này.</p>
              
              <div className="space-y-3 mb-8">
                {[
                  'Chưa tới hạn đăng ký phòng',
                  'Sinh viên khóa này không được đăng ký kí túc xá',
                  'Sinh viên vi phạm nội quy nên bị cấm đăng ký',
                  'Other'
                ].map((reason) => (
                  <label 
                    key={reason} 
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      rejectionData.reason === reason 
                        ? 'border-rose-500 bg-rose-50/50' 
                        : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="rejectionReason" 
                      className="hidden"
                      checked={rejectionData.reason === reason}
                      onChange={() => setRejectionData({ ...rejectionData, reason })}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      rejectionData.reason === reason ? 'border-rose-500 bg-rose-500' : 'border-slate-200 bg-white'
                    }`}>
                      {rejectionData.reason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className={`text-sm font-bold ${rejectionData.reason === reason ? 'text-rose-700' : 'text-slate-600'}`}>
                      {reason === 'Other' ? 'Lý do khác...' : reason}
                    </span>
                  </label>
                ))}

                {rejectionData.reason === 'Other' && (
                  <textarea
                    placeholder="Nhập lý do cụ thể tại đây..."
                    value={rejectionData.otherText}
                    onChange={(e) => setRejectionData({ ...rejectionData, otherText: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-slate-300 min-h-[100px]"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="ghost"
                  onClick={() => setRejectingId(null)}
                  className="flex-1 bg-slate-100 text-slate-800 py-3 rounded-2xl font-bold hover:bg-slate-200 transition"
                >
                  Hủy
                </Button>
                <DangerButton 
                  onClick={handleReject}
                  disabled={!rejectionData.reason || (rejectionData.reason === 'Other' && !rejectionData.otherText)}
                  className="flex-[2] py-3 rounded-2xl"
                >
                  Xác nhận từ chối
                </DangerButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
