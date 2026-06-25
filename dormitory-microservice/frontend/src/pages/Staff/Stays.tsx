import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Student {
  userId: string;
  fullName: string;
  studentCode: string;
  studentCardId?: string;
}

interface Stay {
  id: string;
  studentId: string;
  roomId: string;
  status: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: string;
}

interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: string;
  gender: string;
  status: string;
  price: number;
}

export default function StaffStays() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, staysRes, studentsRes] = await Promise.all([
        api.getRooms(token!),
        api.getStays(token!),
        api.getStudents(token!)
      ]);
      setRooms(roomsRes.rooms || roomsRes || []);
      setStays(staysRes.data || staysRes || []);
      setStudents(studentsRes.students || studentsRes || []);
    } catch (error) {
      console.error('Failed to fetch residency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveStaysForRoom = (roomId: string) => {
    return stays.filter(s => s.roomId === roomId && s.status === 'ACTIVE');
  };

  const roomsWithResidents = rooms.filter(room => getActiveStaysForRoom(room.id).length > 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu cư trú...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">🏘️ Quản lý cư trú</h1>
          <p className="mt-2 text-lg text-slate-500 font-medium italic">Theo dõi và quản lý sinh viên đang nội trú tại các phòng</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
            <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                {roomsWithResidents.length} Phòng có sinh viên
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roomsWithResidents.length === 0 ? (
          <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
             <div className="text-6xl mb-6">🏜️</div>
             <p className="text-slate-400 text-xl font-bold italic">Hiện chưa có phòng nào có sinh viên cư trú.</p>
          </div>
        ) : (
          roomsWithResidents.map((room) => {
            const activeStays = getActiveStaysForRoom(room.id);
            const occupancyRate = (activeStays.length / room.capacity) * 100;
            
            return (
              <div 
                key={room.id} 
                onClick={() => setViewingRoom(room)}
                className="group bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer relative"
              >
                <div className={`absolute top-0 left-0 w-full h-2 ${room.gender === 'MALE' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
                
                <div className="p-8">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">Phòng {room.roomNumber}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${room.gender === 'MALE' ? 'text-blue-600' : 'text-rose-600'}`}>
                            {room.gender === 'MALE' ? '🛡️ Khu Nam' : '🌸 Khu Nữ'}
                        </span>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        🚪
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-50">
                              Mức độ lấp đầy
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black inline-block text-indigo-600">
                              {activeStays.length}/{room.capacity}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100">
                          <div 
                            style={{ width: `${occupancyRate}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                                occupancyRate === 100 ? 'bg-rose-500' : 'bg-indigo-600'
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Đang ở</span>
                            <span className="text-xl font-black text-slate-800">{activeStays.length} SV</span>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Còn trống</span>
                            <span className="text-xl font-black text-emerald-600">{room.capacity - activeStays.length} chỗ</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <span className="text-xs font-bold uppercase tracking-widest">Xem danh sách sinh viên</span>
                      <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Room Detail Modal */}
      {viewingRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-10">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">Phòng {viewingRoom.roomNumber}</h3>
                    <p className="text-slate-500 font-medium mt-2">Danh sách sinh viên đang cư trú chính thức</p>
                  </div>
                  <button onClick={() => setViewingRoom(null)} className="p-4 hover:bg-slate-50 rounded-[1.5rem] transition text-slate-400 text-2xl">✕</button>
               </div>

               <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden mb-10">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200/50">
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinh viên</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã số sinh viên</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời hạn cư trú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getActiveStaysForRoom(viewingRoom.id).map(stay => {
                        const student = students.find(s => s.userId === stay.studentId);
                        return (
                          <tr key={stay.id} className="hover:bg-white transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                                        {student?.fullName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span className="font-bold text-slate-800">{student?.fullName || stay.studentId.slice(-6).toUpperCase()}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="font-black text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">
                                    {student?.studentCode || (student as any)?.student_code || student?.studentCardId || `SV-${stay.studentId.slice(-6).toUpperCase()}`}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">
                                        {new Date(stay.startDate).toLocaleDateString('vi-VN')} - {new Date(stay.endDate).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                                        HK{stay.semester} • {stay.academicYear}
                                    </span>
                                </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>

               <div className="flex justify-end">
                  <Button 
                    onClick={() => setViewingRoom(null)} 
                    className="bg-slate-900 hover:bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-100 transition-all hover:scale-105 active:scale-95"
                  >
                      Đóng thông tin
                  </Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
