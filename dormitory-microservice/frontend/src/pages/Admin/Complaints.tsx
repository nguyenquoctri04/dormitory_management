import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Complaint {
  id: string;
  student_id: string;
  room_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
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
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.updateComplaintStatus(token!, id, { status: 'RESOLVED' });
      await fetchComplaints();
    } catch (error) {
      console.error('Failed to resolve complaint:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Quản lý khiếu nại</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID Sinh viên</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Mô tả</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">{complaint.title}</td>
                <td className="px-6 py-3">{complaint.student_id}</td>
                <td className="px-6 py-3">{complaint.description}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded text-white ${
                      complaint.status === 'RESOLVED' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}
                  >
                    {complaint.status === 'RESOLVED' ? 'Đã giải quyết' : 'Chờ xử lý'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {complaint.status !== 'RESOLVED' && (
                    <Button
                      onClick={() => handleResolve(complaint.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded cursor-pointer transition"
                    >
                      Giải quyết
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
