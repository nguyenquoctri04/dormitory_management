import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Registration {
  id: string;
  student_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
}

export default function AdminRegistrations() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.getRegistrations(token!);
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveRegistration(token!, id);
      await fetchRegistrations();
    } catch (error) {
      console.error('Failed to approve registration:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectRegistration(token!, id);
      await fetchRegistrations();
    } catch (error) {
      console.error('Failed to reject registration:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Quản lý đăng ký phòng</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID Sinh viên</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID Phòng</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày nhập</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày rời</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{reg.student_id}</td>
                <td className="px-6 py-3">{reg.room_id}</td>
                <td className="px-6 py-3">{new Date(reg.check_in_date).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-3">{new Date(reg.check_out_date).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded text-white ${
                      reg.status === 'APPROVED'
                        ? 'bg-green-600'
                        : reg.status === 'REJECTED'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'
                    }`}
                  >
                    {reg.status === 'APPROVED' ? 'Phê duyệt' : reg.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="px-6 py-3 space-x-2">
                  {reg.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => handleApprove(reg.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded cursor-pointer transition"
                      >
                        Duyệt
                      </Button>
                      <Button
                        onClick={() => handleReject(reg.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded cursor-pointer transition"
                      >
                        Từ chối
                      </Button>
                    </>
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
