import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

interface Registration {
  id: string;
  studentId: string;
  roomId: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;

}

export default function StudentRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVNPayResult();
    fetchRegistrations();
  }, []);

  const checkVNPayResult = async () => {
    const params = new URLSearchParams(window.location.search);
    const responseCode = params.get('vnp_ResponseCode');
    const txnRef = params.get('vnp_TxnRef'); // This is our paymentId

    if (!responseCode || !txnRef) return; // Not a VNPay redirect

    // Build the full params object to send to backend for signature re-verification
    const vnpParams: Record<string, string> = {};
    params.forEach((value, key) => {
      vnpParams[key] = value;
    });

    if (responseCode === '00') {
      // Payment SUCCESS: call backend to re-verify signature and fire payment.completed event
      try {
        console.log('✅ VNPay returned success, confirming payment with backend...');
        const res = await api.confirmVnpayPayment(token!, vnpParams);
        // Small delay to let RabbitMQ events propagate
        setTimeout(() => {
          fetchRegistrations();
          alert(res.message || 'Thanh toán thành công!');
        }, 1500);
      } catch (err: any) {
        console.error('Payment confirmation failed:', err);
        // Even if confirm fails (e.g. already processed), still refresh
        setTimeout(() => {
          fetchRegistrations();
          alert('Thanh toán có thể đã được xử lý. Vui lòng kiểm tra lại lịch sử đăng ký.');
        }, 800);
      }
    } else {
      // Payment FAILED or CANCELLED: rollback the registration
      console.log('❌ Payment failed, initiating rollback...');
      try {
        await api.rollbackPayment(token!, txnRef);
        setTimeout(() => {
          fetchRegistrations();
          alert('Thanh toán thất bại hoặc đã bị hủy. Yêu cầu đăng ký đã được hoàn tác. Bạn có thể đăng ký lại.');
        }, 800);
      } catch (err) {
        console.error('Rollback failed:', err);
        fetchRegistrations();
      }
    }

    // Clean up URL params so the check doesn't re-run on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const [regRes, roomRes] = await Promise.all([
        api.getMyRegistrations(token!),
        api.getRooms(token!)
      ]);
      // Filter out WAITING_PAYMENT so they don't show up in history yet
      const filtered = (regRes || []).filter((r: any) => r.status !== 'WAITING_PAYMENT');
      setRegistrations(filtered);
      setRooms(roomRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'REJECTED':
        return { text: 'Từ chối', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'PENDING':
        return { text: 'Đang chờ', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      default:
        return { text: status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📋 Lịch sử đăng ký</h1>
        <p className="mt-2 text-lg text-gray-500 font-medium">Theo dõi trạng thái các yêu cầu đăng ký phòng của bạn</p>
      </header>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Mã đăng ký</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Phòng</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Năm học / Kỳ</th>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lý do từ chối</th>
                <th className="px-8 py-5 text-right text-xs font-extrabold text-slate-400 uppercase tracking-widest">Ngày gửi</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                    <div className="text-4xl mb-4 text-slate-200">📑</div>
                    Bạn chưa có yêu cầu đăng ký nào
                  </td>
                </tr>
              ) : (
                 registrations.map((reg) => {
                   const status = getStatusDisplay(reg.status);
                   const room = rooms.find(r => r.id === reg.roomId);
                   return (
                     <tr key={reg.id} className="hover:bg-slate-50/50 transition truncate group">
                       <td className="px-8 py-6">
                         <span className="font-mono text-xs text-slate-400 group-hover:text-cyan-600 transition-colors">
                           #{reg.id.slice(-8).toUpperCase()}
                         </span>
                       </td>
                       <td className="px-8 py-6 font-bold text-slate-700">
                         {room ? `Phòng ${room.roomNumber}` : (reg.roomId ? 'Đang xếp phòng' : 'Chưa chọn')}
                       </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-600">
                                {reg.academicYear}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                Học kỳ {reg.semester === 'summer' ? 'Hè' : reg.semester}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {reg.status === 'REJECTED' ? (
                          <span className="text-sm text-rose-500 font-medium italic">
                            {reg.rejectionReason || 'Không có lý do'}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-slate-500 font-medium">
                        {new Date(reg.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
