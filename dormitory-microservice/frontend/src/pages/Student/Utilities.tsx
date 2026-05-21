import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Utility {
  id: string;
  room_id: string;
  month: number;
  year: number;
  electricity_index: number;
  water_index: number;
  electricity_cost: number;
  water_cost: number;
  status?: string;
}

export default function StudentUtilities() {
  const { token } = useAuth();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUtilities();
  }, []);

  const fetchUtilities = async () => {
    try {
      setLoading(true);
      const response = await api.getMyUtilities(token!);
      setUtilities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch utilities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Phiếu tiện ích</h1>
      <p className="text-gray-600">Hiển thị cước phí điện nước theo phòng và kỳ thanh toán của bạn.</p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {utilities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có dữ liệu tiện ích</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Phòng</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Kỳ</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Điện</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Nước</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {utilities.map((util) => (
                <tr key={util.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{util.room_id}</td>
                  <td className="px-6 py-3">{util.month}/{util.year}</td>
                  <td className="px-6 py-3">{util.electricity_index}</td>
                  <td className="px-6 py-3">{util.water_index}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">
                    {((util.electricity_cost || 0) + (util.water_cost || 0)).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
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
