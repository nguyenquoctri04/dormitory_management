import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
}

export default function AdminStudents() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.getStudents(token!);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateStudent(token!, editingId, formData);
      } else {
        await api.createStudent(token!, formData);
      }
      await fetchStudents();
      setShowForm(false);
      setEditingId(null);
      setFormData({ full_name: '', email: '', phone: '', date_of_birth: '', address: '' });
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData(student);
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      try {
        await api.deleteStudent(token!, id);
        await fetchStudents();
      } catch (error) {
        console.error('Failed to delete student:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý sinh viên</h1>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ full_name: '', email: '', phone: '', date_of_birth: '', address: '' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
        >
          {showForm ? 'Hủy' : 'Thêm sinh viên'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Chỉnh sửa' : 'Thêm mới'} sinh viên</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Họ tên"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg cursor-pointer transition"
            >
              {editingId ? 'Cập nhật' : 'Thêm'}
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Họ tên</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Điện thoại</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Địa chỉ</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{student.full_name}</td>
                <td className="px-6 py-3">{student.email}</td>
                <td className="px-6 py-3">{student.phone}</td>
                <td className="px-6 py-3">{student.address}</td>
                <td className="px-6 py-3 space-x-2">
                  <Button
                    onClick={() => handleEdit(student)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded cursor-pointer transition"
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => handleDelete(student.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded cursor-pointer transition"
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
