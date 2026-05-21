import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  price: number;
  status: string;
}

export default function StudentRooms() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    check_in_date: '',
    check_out_date: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.getRooms(token!);
      setRooms(response.data?.filter((r: Room) => r.status === 'AVAILABLE') || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.registerRoom(token!, {
        room_id: formData.room_id,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
      });
      setShowForm(false);
      setFormData({ room_id: '', check_in_date: '', check_out_date: '' });
      alert('Đăng ký phòng thành công! Chờ duyệt từ quản trị viên.');
    } catch (error) {
      console.error('Failed to register room:', error);
      alert('Đăng ký phòng thất bại');
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Đăng ký phòng</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
        >
          {showForm ? 'Hủy' : 'Đăng ký phòng'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Đăng ký phòng ký túc xá</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} - ${room.price}/tháng
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.check_in_date}
              onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              value={formData.check_out_date}
              onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg cursor-pointer transition"
            >
              Gửi yêu cầu
            </Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Phòng {room.room_number}</h3>
            <p className="text-gray-600 mb-2">Sức chứa: {room.capacity} người</p>
            <p className="text-lg font-bold text-blue-600 mb-4">${room.price}/tháng</p>
            <Button
              onClick={() => {
                setShowForm(true);
                setFormData({ ...formData, room_id: room.id });
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded cursor-pointer transition"
            >
              Chọn phòng
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
