import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Stay {
  id: string;
  student_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function StudentStays() {
  const { token } = useAuth();
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    try {
      setLoading(true);
      const response = await api.getMyStays(token!);
      setStays(response.data || []);
    } catch (error) {
      console.error('Failed to fetch stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeStay = stays.find((s) => s.status === 'ACTIVE');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-600';
      case 'ENDED':
        return 'bg-gray-600';
      case 'LEFT_EARLY':
        return 'bg-orange-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang ở';
      case 'ENDED':
        return 'Đã kết thúc';
      case 'LEFT_EARLY':
        return 'Rời sớm';
      default:
        return status;
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Lịch sử ở</h1>

      {activeStay && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">Lưu trú hiện tại</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phòng</p>
              <p className="text-lg font-semibold text-gray-800">{activeStay.room_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày vào</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(activeStay.start_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <span className={`inline-block px-3 py-1 rounded text-white text-sm mt-1 ${getStatusColor(activeStay.status)}`}>
                {getStatusText(activeStay.status)}
              </span>
            </div>
            <div>
              <Button
                onClick={() => alert('Yêu cầu rời sớm - chức năng sẽ được cập nhật')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded cursor-pointer transition mt-1"
              >
                Rời sớm
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 p-6 border-b">Tất cả lưu trú</h2>
        {stays.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có dữ liệu lưu trú
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Phòng</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày vào</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày ra</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stays.map((stay) => (
                <tr key={stay.id} className="border-b hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-3 font-semibold">{stay.id}</td>
                  <td className="px-6 py-3">{stay.room_id}</td>
                  <td className="px-6 py-3">
                    {new Date(stay.start_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-3">
                    {stay.end_date ? new Date(stay.end_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(stay.status)}`}>
                      {getStatusText(stay.status)}
                    </span>
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
