import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  type: 'NORMAL' | 'PREMIUM';
  gender: 'MALE' | 'FEMALE';
  status: string;
  price: number;
}

export default function AdminRooms() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    room_number: '',
    capacity: '',
    type: 'NORMAL' as 'NORMAL' | 'PREMIUM',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    status: 'AVAILABLE',
    price: '',
  });

  useEffect(() => {
    if (token) {
      fetchRooms();
    } else {
      // Nếu không có token sau khi load xong Auth, có thể set loading false để hiện thông báo
      setLoading(false);
    }
  }, [token]);

  const fetchRooms = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.getRooms(token);
      setRooms(Array.isArray(response) ? response : (response as any).data || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
      return;
    }
    try {
      const payload = {
        room_number: formData.room_number,
        capacity: parseInt(formData.capacity),
        type: formData.type,
        gender: formData.gender,
        status: formData.status,
        price: parseFloat(formData.price),
      };
      if (editingId) {
        await api.updateRoom(token, editingId.toString(), payload);
      } else {
        await api.createRoom(token, payload);
      }
      await fetchRooms();
      setShowForm(false);
      setEditingId(null);
      setFormData({ 
        room_number: '', 
        capacity: '', 
        type: 'NORMAL', 
        gender: 'MALE', 
        status: 'AVAILABLE',
        price: '' 
      });
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setFormData({
      room_number: room.roomNumber,
      capacity: room.capacity.toString(),
      type: room.type,
      gender: room.gender,
      status: room.status,
      price: room.price.toString(),
    });
    setEditingId(room.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await api.deleteRoom(token, id.toString());
        await fetchRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  const [collapsed, setCollapsed] = useState({ MALE: false, FEMALE: false });

  const toggleCollapse = (gender: 'MALE' | 'FEMALE') => {
    setCollapsed(prev => ({ ...prev, [gender]: !prev[gender] }));
  };

  const sortRooms = (roomList: Room[]) => {
    return [...roomList].sort((a, b) => {
      // 1. Phân loại phòng: Standard -> Superior -> Deluxe -> VIP
      const typePriority: Record<string, number> = { 'NORMAL': 1, 'PREMIUM': 2 };
      const priorityA = typePriority[a.type] || 0;
      const priorityB = typePriority[b.type] || 0;
      
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      // 2. Cùng loại thì xếp theo số phòng tăng dần
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    });
  };

  const maleRooms = sortRooms(rooms.filter(r => r.gender === 'MALE'));
  const femaleRooms = sortRooms(rooms.filter(r => r.gender === 'FEMALE'));

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
      <p className="text-slate-500 font-medium">Đang tải dữ liệu phòng...</p>
    </div>
  );

  const RoomTable = ({ title, data, colorClass, gender }: { title: string, data: Room[], colorClass: string, gender: 'MALE' | 'FEMALE' }) => (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 mb-8">
      <div 
        className={`px-6 py-4 ${colorClass} text-white flex justify-between items-center cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
        onClick={() => toggleCollapse(gender)}
      >
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform duration-300 ${collapsed[gender] ? 'rotate-0' : 'rotate-180'}`}>
                {collapsed[gender] ? '📂' : '📖'}
            </div>
            <div>
                <h3 className="font-bold text-lg tracking-tight">{title}</h3>
                <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest leading-none">
                    {collapsed[gender] ? 'Nhấn để hiện' : 'Nhấn để ẩn'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight backdrop-blur-sm">
                {data.length} phòng
            </span>
            <div className={`transition-transform duration-300 ${collapsed[gender] ? 'rotate-0' : 'rotate-180'}`}>
                ▾
            </div>
        </div>
      </div>
      {!collapsed[gender] && (
        <div className="overflow-x-auto animate-in slide-in-from-top-4 duration-300">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Số phòng</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Loại</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Sức chứa</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Chỗ trống</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giá thuê</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic font-medium">
                  Chưa có phòng nào trong danh sách
                </td>
              </tr>
            ) : (
              data.map((room) => (
                <tr key={room.id} className="hover:bg-blue-50/30 transition group">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{room.roomNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      room.type === 'PREMIUM' 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {room.type === 'PREMIUM' ? '✨ VIP' : 'Thường'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{room.capacity} người</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                    {(room as any).available_slots ?? (room.capacity - ((room as any).current_occupants || (room as any).stays?.length || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(room.price)} đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(room)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                        room.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                        room.status === 'OCCUPIED' || room.status === 'FULL' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                        room.status === 'MAINTENANCE' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                      title="Click để chỉnh sửa trạng thái"
                    >
                      <span className={`h-2 w-2 rounded-full ${
                        room.status === 'AVAILABLE' ? 'bg-emerald-500' : 
                        room.status === 'OCCUPIED' || room.status === 'FULL' ? 'bg-blue-500' : 'bg-rose-500'
                      }`}></span>
                      {room.status === 'AVAILABLE' ? 'Còn trống' : 
                       room.status === 'FULL' || room.status === 'OCCUPIED' ? 'Hết chỗ' : 'Bảo trì'}
                       <span className="text-[10px] opacity-40">✎</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEdit(room)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">Sửa</button>
                    <button onClick={() => handleDelete(room.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">🏢 Quản lý phòng</h1>
          <p className="mt-2 text-lg text-gray-500">Hệ thống phân phối và theo dõi trạng thái phòng ở</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ 
              room_number: '', 
              capacity: '', 
              type: 'NORMAL', 
              gender: 'MALE', 
              status: 'AVAILABLE',
              price: '' 
            });
          }}
          className={`${showForm ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2`}
        >
          {showForm ? '✖ Đóng form' : '🏥 Thêm phòng mới'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 ring-4 ring-indigo-50/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            {editingId ? '🛠 Cập nhật thông tin phòng' : '🏥 Tạo mới phòng ký túc xá'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Số phòng</label>
              <input
                type="text"
                placeholder="Ví dụ: P101"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium bg-gray-50/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Sức chứa</label>
              <input
                type="number"
                placeholder="Người/Phòng"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium bg-gray-50/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Giá thuê (VNĐ)</label>
              <input
                type="number"
                placeholder="Ví dụ: 800000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium bg-gray-50/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Phân loại</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-bold bg-gray-50/50"
              >
                <option value="NORMAL">🏢 Phòng Thường</option>
                <option value="PREMIUM">✨ Phòng VIP</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Dành cho</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-bold bg-gray-50/50"
              >
                <option value="MALE">🛡️ Sinh viên Nam</option>
                <option value="FEMALE">🌸 Sinh viên Nữ</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all font-bold bg-gray-50/50"
              >
                <option value="AVAILABLE">✅ Còn trống</option>
                <option value="FULL">🚫 Hết chỗ</option>
                <option value="MAINTENANCE">🛠 Bảo trì</option>
              </select>
            </div>
            <div className="flex items-end lg:col-span-1">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
              >
                {editingId ? 'Cập nhật phòng' : 'Xác nhận tạo'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 pt-4">
        <RoomTable title="🛡️ Khu vực ưu tiên Nam" data={maleRooms} colorClass="bg-blue-600" gender="MALE" />
        <RoomTable title="🌸 Khu vực ưu tiên Nữ" data={femaleRooms} colorClass="bg-rose-500" gender="FEMALE" />
      </div>
    </div>
  );
}
