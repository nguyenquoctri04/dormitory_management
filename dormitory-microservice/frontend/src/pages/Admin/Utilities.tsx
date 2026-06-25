import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface UtilityRecord {
    id: string;
    roomId: string;
    month: number;
    year: number;
    electricityIndex: number;
    waterIndex: number;
    electricityUsage: number;
    waterUsage: number;
    totalAmount: number;
    status: string;
    createdAt: string;
}

interface Room {
    id: string;
    roomNumber: string;
}

export default function AdminUtilities() {
    const { token } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [utilities, setUtilities] = useState<UtilityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        room_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        electricity_index: '',
        water_index: '',
    });

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomRes, utilRes] = await Promise.all([
                api.getRooms(token!),
                api.getUtilities(token!)
            ]);
            setRooms(Array.isArray(roomRes) ? roomRes : (roomRes as any).data || []);
            setUtilities(utilRes || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createUtility(token!, {
                ...formData,
                electricity_index: parseInt(formData.electricity_index),
                water_index: parseInt(formData.water_index)
            });
            setShowForm(false);
            setFormData({
                room_id: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                electricity_index: '',
                water_index: '',
            });
            fetchData();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex justify-between items-end border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">⚡ Quản lý Điện nước</h1>
                    <p className="mt-2 text-lg text-gray-500 font-medium">Chốt chỉ số và phát hành hóa đơn hàng tháng</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className={`${showForm ? 'bg-slate-800' : 'bg-indigo-600'} text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95`}
                >
                    {showForm ? '✖ Đóng' : '➕ Chốt số tháng mới'}
                </Button>
            </header>

            {showForm && (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in slide-in-from-top-4 duration-300 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">📝 Nhập chỉ số tiêu thụ</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Chọn phòng chính xác</label>
                            <select
                                value={formData.room_id}
                                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/50"
                                required
                            >
                                <option value="">-- Chọn phòng --</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>Phòng {room.roomNumber}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Tháng</label>
                                <input
                                    type="number"
                                    min="1" max="12"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                    className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Năm</label>
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Chỉ số Điện (kWh)</label>
                            <input
                                type="number"
                                placeholder="Nhập chỉ số công tơ điện hiện tại"
                                value={formData.electricity_index}
                                onChange={(e) => setFormData({ ...formData, electricity_index: e.target.value })}
                                className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">Chỉ số Nước (m³)</label>
                            <input
                                type="number"
                                placeholder="Nhập chỉ số đồng hồ nước hiện tại"
                                value={formData.water_index}
                                onChange={(e) => setFormData({ ...formData, water_index: e.target.value })}
                                className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/50"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                            >
                                🔔 Xác nhận & Phát hành hóa đơn
                            </Button>
                            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium italic">
                                * Lưu ý: Hệ thống sẽ tự động tính tiêu thụ dựa trên chỉ số tháng gần nhất và chia đều cho toàn bộ sinh viên trong phòng.
                            </p>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
                    <h3 className="font-bold text-xl flex items-center gap-2">📊 Lịch sử chốt số & Thanh toán</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Phòng</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Thời gian</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Tiêu thụ (E/W)</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Tổng tiền</th>
                                <th className="px-8 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Trạng thái phòng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {utilities.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-bold">
                                        📭 Chưa có dữ liệu điện nước
                                    </td>
                                </tr>
                            ) : (
                                utilities.map((util) => {
                                    const room = rooms.find(r => r.id === util.roomId);
                                    return (
                                        <tr key={util.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-8 py-6">
                                                <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-black text-sm">
                                                    {room?.roomNumber || 'Phòng chờ'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">Tháng {util.month}/{util.year}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Chốt ngày: {new Date(util.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-amber-600 uppercase leading-none mb-1">Điện</span>
                                                        <span className="font-black text-slate-700">{util.electricityUsage} kWh</span>
                                                    </div>
                                                    <div className="flex flex-col border-l border-slate-100 pl-4">
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase leading-none mb-1">Nước</span>
                                                        <span className="font-black text-slate-700">{util.waterUsage} m³</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-base font-black text-rose-600">
                                                    {new Intl.NumberFormat('vi-VN').format(util.totalAmount)} đ
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    util.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    util.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-rose-100 text-rose-700 border-rose-200'
                                                }`}>
                                                    {util.status === 'PAID' ? '✅ Đã tất toán' :
                                                     util.status === 'PARTIALLY_PAID' ? '🕒 Đang chờ nộp đủ' :
                                                     '🚫 Chưa thanh toán'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
