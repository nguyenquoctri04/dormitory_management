import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';
import DangerButton from '../../components/ui/DangerButton';


interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: 'NORMAL' | 'PREMIUM';
  gender: 'MALE' | 'FEMALE';
  status: string;
  price?: number;
  current_occupants?: number;
  available_slots?: number;
  stays?: any[];
}

export default function StudentRooms() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    gender: '',
  });

  const [registeringRoom, setRegisteringRoom] = useState<Room | null>(null);

  const getRegistrationContext = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();

    let semester = '1';
    let year1 = year;

    // Logic: 
    // HK1: 15/08 - 14/01 (Year Part 1 starts here)
    // HK2: 15/01 - 14/06
    // HK Hè: 15/06 - 14/08

    const isAfterOrOn = (m1: number, d1: number, m2: number, d2: number) => 
      m1 > m2 || (m1 === m2 && d1 >= d2);

    if (isAfterOrOn(month, day, 8, 15)) {
      semester = '1';
      year1 = year;
    } else if (isAfterOrOn(month, day, 6, 15)) {
      semester = 'summer';
      year1 = year - 1;
    } else if (isAfterOrOn(month, day, 1, 15)) {
      semester = '2';
      year1 = year - 1;
    } else {
      semester = '1';
      year1 = year - 1;
    }

    const academicYear = `${year1}-${year1 + 1}`;
    
    let start_date = '';
    let end_date = '';
    
    if (semester === '1') {
      start_date = `${year1}-08-15`;
      end_date = `${year1 + 1}-01-15`;
    } else if (semester === '2') {
      start_date = `${year1 + 1}-01-15`;
      end_date = `${year1 + 1}-06-15`;
    } else if (semester === 'summer') {
      start_date = `${year1 + 1}-06-15`;
      end_date = `${year1 + 1}-08-15`;
    }

    return { academicYear, semester, start_date, end_date };
  };

  const currentRegistration = getRegistrationContext();

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.gender) queryParams.append('gender', filters.gender);

      // Note: getRooms in api.ts might need update to accept filters, 
      // but let's assume it fetches all and we filter locally if backend doesn't support query yet.
      // Actually roomController.js supports type, gender, status query params.
      
      const response = await api.getRooms(token!);
      let data = response;
      if (data.data) data = data.data; // Handle different response formats

      // Local filtering for "FULL" vs "AVAILABLE" if needed, 
      // but let's trust the data if it comes with current_occupants
      let filtered = data;
      if (filters.status === 'FULL') {
        filtered = data.filter((r: Room) => (r.available_slots ?? (r.capacity - (r.current_occupants ?? r.stays?.length ?? 0))) === 0);
      } else if (filters.status === 'AVAILABLE') {
        filtered = data.filter((r: Room) => (r.available_slots ?? (r.capacity - (r.current_occupants ?? r.stays?.length ?? 0))) > 0);
      }

      if (filters.type) {
        filtered = filtered.filter((r: Room) => r.type === filters.type);
      }
      if (filters.gender) {
        filtered = filtered.filter((r: Room) => r.gender === filters.gender);
      }

      setRooms(filtered || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'VNPAY'>('VNPAY');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringRoom) return;

    if (!showPaymentSelection) {
      setShowPaymentSelection(true);
      return;
    }

    try {
      const calculatedAmount = (registeringRoom.price || 0) * (currentRegistration.semester === 'summer' ? 2 : 5);
      
      const regResponse = await api.createRegistration(token!, {
        room_id: registeringRoom.id,
        requested_room_type: registeringRoom.type,
        requested_gender: registeringRoom.gender,
        period_id: currentRegistration.semester === 'summer' ? '2_MONTHS' : '5_MONTHS',
        start_date: currentRegistration.start_date,
        end_date: currentRegistration.end_date,
        academic_year: currentRegistration.academicYear,
        semester: currentRegistration.semester,
        type: 'STAY', 
        amount: calculatedAmount,
        payment_method: paymentMethod,
        paymentMethod: paymentMethod // Dual sending for safety
      });

      const registration = regResponse.registration || regResponse;

      if (paymentMethod === 'VNPAY') {
        // Create VNPay Payment URL - pass roomId so payment record is fully populated
        const amount = (registeringRoom.price || 0) * (currentRegistration.semester === 'summer' ? 2 : 5);
        const payRes = await api.createVnpayUrl(token!, {
          registrationId: registration.id,
          amount: amount,
          roomId: registeringRoom.id,   // ← ensures payment.roomId is set correctly
        } as any);
        
        if (payRes.paymentUrl) {
          window.location.href = payRes.paymentUrl;
          return;
        }
      }

      setRegisteringRoom(null);
      setShowPaymentSelection(false);
      alert('Đăng ký phòng thành công! Đang chờ quản trị viên phê duyệt.');
      fetchRooms();
    } catch (error: any) {
      console.error('Failed to register room:', error);
      const msg = error.message || 'Đăng ký phòng thất bại. Vui lòng kiểm tra lại thông tin.';
      alert(msg);
    }
  };


  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh sách phòng</h1>
          <p className="text-gray-600 mt-2">Xem thông tin và đăng ký ở ký túc xá.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Còn trống</option>
              <option value="FULL">Đã đầy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Loại phòng</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">Tất cả loại</option>
              <option value="NORMAL">Phòng thường</option>
              <option value="PREMIUM">Phòng VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Đối tượng</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => {
              const currentOccupants = room.current_occupants ?? room.stays?.length ?? 0;
              const availableSlots = room.available_slots ?? (room.capacity - currentOccupants);
              const percentage = (currentOccupants / room.capacity) * 100;

              return (
                <div 
                  key={room.id} 
                  className={`bg-white rounded-2xl shadow-lg shadow-slate-100 hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col ${
                    availableSlots === 0 ? 'opacity-90' : ''
                  }`}
                >
                  <div className={`h-2 w-full ${
                    room.type === 'PREMIUM' ? 'bg-amber-400' : 'bg-cyan-500'
                  }`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Phòng {room.roomNumber}</h3>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 ${
                            room.type === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-600'
                        }`}>
                            {room.type === 'PREMIUM' ? 'VIP' : 'THƯỜNG'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">GIÁ THUÊ</p>
                        <p className="text-lg font-bold text-cyan-600">
                          {new Intl.NumberFormat('vi-VN').format(room.price || 0)} <span className="text-[10px]">đ/th</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center text-sm">
                        <span className="w-20 text-slate-400 font-medium">Đối tượng:</span>
                        <span className={`font-bold ${room.gender === 'MALE' ? 'text-blue-500' : 'text-pink-500'}`}>
                          {room.gender === 'MALE' ? '♂ Nam' : '♀ Nữ'}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Trạng thái</span>
                          <span className="text-xs font-bold text-slate-600">
                            {currentOccupants}/{room.capacity} người
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ease-out ${
                              availableSlots === 0 ? 'bg-rose-500' : (room.type === 'PREMIUM' ? 'bg-amber-400' : 'bg-cyan-500')
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic text-right">
                          {availableSlots === 0 ? 'Phòng đã đầy' : `Còn trống ${availableSlots} chỗ`}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setRegisteringRoom(room)}
                      disabled={availableSlots === 0 || room.status === 'MAINTENANCE'}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        availableSlots === 0 || room.status === 'MAINTENANCE'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-100'
                      }`}
                    >
                      {room.status === 'MAINTENANCE' ? 'Đang bảo trì' : availableSlots === 0 ? 'Hết chỗ' : 'Đăng ký ngay'}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Registration Modal */}
      {registeringRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Đăng ký phòng {registeringRoom.roomNumber}</h2>
                <button 
                  onClick={() => setRegisteringRoom(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {showPaymentSelection ? (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-lg font-bold text-slate-800">Chọn phương thức thanh toán</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        onClick={() => setPaymentMethod('VNPAY')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                          paymentMethod === 'VNPAY' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-xl">💳</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">VNPay (Thanh toán QR)</p>
                          <p className="text-[10px] text-slate-500">Tự động duyệt ngay sau khi thanh toán</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                          paymentMethod === 'CASH' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-xl">🏢</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Tại phòng Tài Chính</p>
                          <p className="text-[10px] text-slate-500">Nhân viên sẽ duyệt sau khi bạn đóng tiền</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Năm học</span>
                          <span className="text-slate-800 font-black">{currentRegistration.academicYear}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Học kỳ</span>
                          <span className="text-cyan-600 font-black">
                            {currentRegistration.semester === 'summer' ? 'Kỳ hè' : `Học kỳ ${currentRegistration.semester}`}
                          </span>
                        </div>
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Thời gian dự kiến</span>
                          <span className="text-slate-600 font-bold">
                            {new Date(currentRegistration.start_date).toLocaleDateString('vi-VN')} - {new Date(currentRegistration.end_date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                    </div>

                    <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
                      <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Tổng tiền dự kiến</p>
                            <p className="text-3xl font-black text-cyan-700 tracking-tighter">
                              {new Intl.NumberFormat('vi-VN').format((registeringRoom.price || 0) * (currentRegistration.semester === 'summer' ? 2 : 5))} đ
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-cyan-600/60 uppercase block">Đơn giá</span>
                            <span className="text-xs font-black text-cyan-700">
                               {new Intl.NumberFormat('vi-VN').format(registeringRoom.price || 0)} đ/th
                            </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-cyan-600 mt-4 border-t border-cyan-200/50 pt-3 italic font-medium leading-relaxed">
                        * Khoản phí này bao gồm tiền phòng cho toàn bộ học kỳ ({currentRegistration.semester === 'summer' ? '2' : '5'} tháng).
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <DangerButton
                    type="button"
                    onClick={() => {
                        if (showPaymentSelection) {
                            setShowPaymentSelection(false);
                        } else {
                            setRegisteringRoom(null);
                        }
                    }}
                    className="flex-1 py-3 rounded-xl transition"
                  >
                    {showPaymentSelection ? 'Quay lại' : 'Hủy'}
                  </DangerButton>

                  <Button
                    type="submit"
                    className="flex-[2] py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-100 transition"
                  >
                    {showPaymentSelection ? 'Thanh toán ngay' : 'Xác nhận đăng ký'}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
