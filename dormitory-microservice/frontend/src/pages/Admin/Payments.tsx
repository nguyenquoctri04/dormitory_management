import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  status: string;
}

export default function AdminPayments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getPayments(token!);
      setPayments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approvePayment(token!, id);
      await fetchPayments();
    } catch (error) {
      console.error('Failed to approve payment:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Quản lý thanh toán</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID Sinh viên</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Số tiền</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày thanh toán</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{payment.student_id}</td>
                <td className="px-6 py-3">${payment.amount}</td>
                <td className="px-6 py-3">{new Date(payment.payment_date).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded text-white ${
                      payment.status === 'COMPLETED' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}
                  >
                    {payment.status === 'COMPLETED' ? 'Hoàn tất' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {payment.status !== 'COMPLETED' && (
                    <Button
                      onClick={() => handleApprove(payment.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded cursor-pointer transition"
                    >
                      Duyệt
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
