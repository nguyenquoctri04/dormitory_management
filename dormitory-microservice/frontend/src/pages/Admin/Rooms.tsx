import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  price: number;
  status: string;
}

export default function AdminRooms() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    room_number: '',
    capacity: '',
    price: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.getRooms(token!);
      setRooms(response.data || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        room_number: formData.room_number,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        status: formData.status,
      };
      if (editingId) {
        await api.updateRoom(token!, editingId, payload);
      } else {
        await api.createRoom(token!, payload);
      }
      await fetchRooms();
      setShowForm(false);
      setEditingId(null);
      setFormData({ room_number: '', capacity: '', price: '', status: 'AVAILABLE' });
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setFormData({
      room_number: room.room_number,
      capacity: room.capacity.toString(),
      price: room.price.toString(),
      status: room.status,
    });
    setEditingId(room.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await api.deleteRoom(token!, id);
        await fetchRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý phòng</h1>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ room_number: '', capacity: '', price: '', status: 'AVAILABLE' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
        >
          {showForm ? 'Hủy' : 'Thêm phòng'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Chỉnh sửa' : 'Thêm mới'} phòng</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Số phòng"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Sức chứa"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Giá tiền"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AVAILABLE">Còn trống</option>
              <option value="OCCUPIED">Đã cho thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
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
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Số phòng</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Sức chứa</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Giá tiền</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Trạng thái</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{room.room_number}</td>
                <td className="px-6 py-3">{room.capacity}</td>
                <td className="px-6 py-3">${room.price}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded text-white ${
                      room.status === 'AVAILABLE'
                        ? 'bg-green-600'
                        : room.status === 'OCCUPIED'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'
                    }`}
                  >
                    {room.status === 'AVAILABLE'
                      ? 'Còn trống'
                      : room.status === 'OCCUPIED'
                        ? 'Đã cho thuê'
                        : 'Bảo trì'}
                  </span>
                </td>
                <td className="px-6 py-3 space-x-2">
                  <Button
                    onClick={() => handleEdit(room)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded cursor-pointer transition"
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => handleDelete(room.id)}
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
