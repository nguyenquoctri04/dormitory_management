import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  status: string;
  payment_date: string;
}

export default function StudentPayments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getMyPayments(token!);
      setPayments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
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
      case 'PAID':
        return 'bg-green-600';
      case 'PENDING':
        return 'bg-yellow-600';
      case 'FAILED':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Lịch sử thanh toán</h1>

      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded cursor-pointer transition ${
            filter === 'ALL' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả
        </Button>
        <Button
          onClick={() => setFilter('PAID')}
          className={`px-4 py-2 rounded cursor-pointer transition ${
            filter === 'PAID' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Đã thanh toán
        </Button>
        <Button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded cursor-pointer transition ${
            filter === 'PENDING' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Chờ thanh toán
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có dữ liệu thanh toán
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Số tiền</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-3 font-semibold">{payment.id}</td>
                  <td className="px-6 py-3">
                    {payment.amount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {new Date(payment.payment_date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
