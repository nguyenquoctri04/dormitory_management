import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function DormitoryRules() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Kiểm tra xem sinh viên đã đọc nội quy trong phiên làm việc này chưa
        const hasRead = sessionStorage.getItem('hasReadRules');
        if (!hasRead) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasReadRules', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with Heavy Blur */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-700"
                onClick={handleClose}
            ></div>

            {/* Modal Container with Pulsing Neon Border */}
            <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border-4 border-transparent bg-clip-padding group">
                
                {/* Pulsing Animated Border Effect */}
                <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-75 blur-sm animate-pulse"></div>

                {/* Content Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
                    <h2 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <span className="animate-bounce">📜</span> NỘI QUY KÝ TÚC XÁ
                    </h2>
                    <p className="text-indigo-100 font-medium opacity-90 italic">Vì một cộng đồng sinh viên văn minh và hiện đại</p>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 text-white/10 text-8xl font-black pointer-events-none">DOCS</div>
                </div>

                {/* Rules List - Scrollable Area */}
                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
                    
                    {/* Section 1: Giờ giấc */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="p-2 bg-indigo-100 rounded-lg">⏰</span> Giờ giấc sinh hoạt
                        </h3>
                        <ul className="grid grid-cols-1 gap-2 text-slate-600 font-bold ml-11 list-disc">
                            <li>Giờ mở cổng: <span className="text-slate-900 text-lg">05:00</span> sáng</li>
                            <li>Giờ đóng cổng: <span className="text-rose-600 text-lg">23:00</span> đêm</li>
                            <li>Sau 23:00 vui lòng không gây ồn ào ảnh hưởng phòng khác</li>
                        </ul>
                    </section>

                    {/* Section 2: Vệ sinh */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="p-2 bg-emerald-100 rounded-lg">🧹</span> Vệ sinh chung
                        </h3>
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 ml-11">
                            <p className="text-slate-600 font-bold leading-relaxed mb-0">
                                Sinh viên có trách nhiệm tự vệ sinh không gian sống cá nhân và khu vực phòng ở. Rác thải phải được phân loại và bỏ đúng nơi quy định trước 8:00 sáng hàng ngày.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Điện nước */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="p-2 bg-amber-100 rounded-lg">⚡</span> Đơn giá Tiện ích
                        </h3>
                        <div className="grid grid-cols-2 gap-4 ml-11">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-black text-slate-400">Giá Điện</span>
                                <span className="text-xl font-black text-amber-600">3.000 đ/kWh</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-black text-slate-400">Giá Nước</span>
                                <span className="text-xl font-black text-blue-600">12.000 đ/m³</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Đăng ký */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="p-2 bg-rose-100 rounded-lg">📝</span> Quy chế Đăng ký
                        </h3>
                        <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100 border-dashed ml-11 space-y-2">
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <span className="text-rose-500">▶</span> Đăng ký theo từng học kỳ (5 tháng) hoặc hè (2 tháng).
                            </p>
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <span className="text-rose-500">▶</span> Thanh toán trước khi nhận phòng.
                            </p>
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <span className="text-rose-500">▶</span> Chấp hành nghiêm chỉnh lệnh điều động sắp xếp phòng.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer with Acknowledgement Button */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-4">
                    <Button 
                        onClick={handleClose}
                        className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Tôi đã đọc và cam kết tuân thủ
                    </Button>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        * Nhấn xác nhận để bắt đầu làm việc với hệ thống
                    </p>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
