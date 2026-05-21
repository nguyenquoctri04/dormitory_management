import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function StudentComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.getMyComplaints(token!);
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitComplaint(token!, formData);
      setShowForm(false);
      setFormData({ title: '', description: '' });
      await fetchComplaints();
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      alert('Gửi khiếu nại thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'Đã giải quyết';
      case 'PENDING':
        return 'Chờ xử lý';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-600';
      case 'PENDING':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Khiếu nại</h1>
          <p className="text-gray-600">Theo dõi trạng thái khiếu nại và gửi mới yêu cầu.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
        >
          {showForm ? 'Đóng' : 'Gửi khiếu nại'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Gửi khiếu nại mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề khiếu nại"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết vấn đề của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
            >
              Gửi khiếu nại
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ngày gửi</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  Chưa có khiếu nại nào.
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{complaint.title}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(complaint.status)}`}>
                      {getStatusText(complaint.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(complaint.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
