import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  status: string;
  paymentDate?: string;
  createdAt: string;
  paymentMethod?: string;
  description?: string;
  type?: string; // For invoices
}

interface Stay {
  id: string;
  status: string;
}

export default function StudentPayments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, invoicesRes, staysRes] = await Promise.all([
        api.getMyPayments(token!),
        api.getMyInvoices(token!),
        api.getMyStays(token!)
      ]);
      
      const paymentsData = paymentsRes.data || paymentsRes || [];
      const invoicesData = invoicesRes.data || invoicesRes || [];
      
      // Combine them: Mark invoices so we can distinguish if needed
      // Logic: Hide UNPAID invoices that are not CASH (they are garbage from failed/pending VNPay)
      const merged = [
        ...paymentsData.map((p: any) => ({ ...p, isPayment: true })),
        ...invoicesData
            .filter((i: any) => i.status !== 'UNPAID' || i.paymentMethod === 'CASH' || !i.registrationId) // Show PAID ones or CASH UNPAID ones
            .map((i: any) => ({ ...i, isInvoice: true, paymentDate: i.createdAt }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPayments(merged);
      setStays(staysRes.data || staysRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments =
    filter === 'ALL'
      ? payments
      : payments.filter((p) => p.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-600';
      case 'PENDING': return 'bg-amber-600';
      case 'UNPAID': return 'bg-rose-600 shadow-rose-100 shadow-sm';
      case 'FAILED': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Thành công';
      case 'PENDING': return 'Đang xử lý';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'FAILED': return 'Thất bại';
      default: return status;
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  const hasHistory = payments.length > 0;

  if (!hasHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 max-w-lg shadow-xl shadow-amber-50">
          <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lịch sử trống</h2>
          <p className="text-gray-600">Bạn chưa có bất kỳ hóa đơn hoặc giao dịch thanh toán nào.</p>
          <Button 
            onClick={() => window.location.href = '/student/rooms'}
            className="mt-6 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl transition"
          >
            Đăng ký phòng ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lịch sử thanh toán</h1>
          <p className="text-gray-600">Minh bạch các khoản phí và giao dịch của bạn.</p>
        </div>

        <div className="inline-flex p-1 bg-white rounded-xl shadow-sm border border-gray-100">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PAID', label: 'Thành công' },
            { id: 'PENDING', label: 'Đang chờ' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === tab.id 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 overflow-hidden border border-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mã GD</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Số tiền</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Phương thức</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ngày giao dịch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic">
                    Không tìm thấy giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-4 font-mono text-xs text-gray-400">#{payment.id.substring(0, 8)}...</td>
                    <td className="px-8 py-4 font-black text-gray-800">
                      {payment.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      {payment.paymentMethod ? (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                          payment.paymentMethod === 'VNPAY' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>
                          {payment.paymentMethod === 'VNPAY' ? '💳 VNPay' : '💵 Tiền mặt'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-50 text-slate-400 border border-slate-100">
                          📄 Hóa đơn
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500 font-medium">
                      {payment.paymentDate 
                        ? new Date(payment.paymentDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'
                      }
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
