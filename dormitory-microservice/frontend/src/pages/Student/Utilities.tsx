import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import Button from '../../components/ui/Button';

interface Invoice {
    id: string;
    roomId: string;
    type: string;
    amount: number;
    status: string;
    month: number;
    year: number;
    utilityId: string;
    createdAt: string;
}

export default function StudentUtilities() {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            checkVNPayResult();
            fetchInvoices();
        }
    }, [token]);

    const checkVNPayResult = async () => {
        const params = new URLSearchParams(window.location.search);
        const responseCode = params.get('vnp_ResponseCode');
        const txnRef = params.get('vnp_TxnRef');

        if (!responseCode || !txnRef) return;

        const vnpParams: Record<string, string> = {};
        params.forEach((value, key) => {
            vnpParams[key] = value;
        });

        if (responseCode === '00') {
            try {
                const res = await api.confirmVnpayPayment(token!, vnpParams);
                setTimeout(() => {
                    fetchInvoices();
                    alert(res.message || 'Thanh toán thành công!');
                }, 1000);
            } catch (err: any) {
                console.error('Payment confirmation failed:', err);
                setTimeout(() => {
                    fetchInvoices();
                    alert('Thanh toán có thể đã được xử lý. Vui lòng kiểm tra lại.');
                }, 800);
            }
        } else {
            alert('Thanh toán không thành công hoặc đã bị hủy.');
        }

        window.history.replaceState({}, document.title, window.location.pathname);
    };

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await api.getMyInvoices(token!);
            // Filter only UTILITY type invoices
            const utilityInvoices = (res || []).filter((inv: Invoice) => inv.type === 'UTILITY');
            setInvoices(utilityInvoices);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayVNPay = async (invoice: Invoice) => {
        try {
            setPayingId(invoice.id);
            // In a real app, this would redirect to VNPay
            // For now, we simulate success or provide the payment URL generation
            const res = await api.createPayment(token!, {
                invoice_id: invoice.id,
                payment_method: 'VNPAY',
                amount: invoice.amount
            });
            
            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                alert('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
            }
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        } finally {
            setPayingId(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="border-b border-gray-100 pb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">⚡ Tiền Điện & Nước</h1>
                <p className="mt-2 text-lg text-gray-500 font-medium">Theo dõi và thanh toán các hóa đơn tiêu thụ hàng tháng</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.length === 0 ? (
                    <div className="col-span-full bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                        <div className="text-6xl mb-4 text-slate-200">✨</div>
                        <h3 className="text-xl font-bold text-slate-400">Bạn hiện không có hóa đơn điện nước nào cần thanh toán</h3>
                    </div>
                ) : (
                    invoices.map((inv) => (
                        <div key={inv.id} className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden flex flex-col group hover:ring-2 hover:ring-indigo-500/10 transition-all">
                            <div className={`p-6 ${inv.status === 'PAID' ? 'bg-emerald-600' : 'bg-rose-500'} text-white`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">Hóa đơn tháng</p>
                                        <h3 className="text-2xl font-black">{inv.month} / {inv.year}</h3>
                                    </div>
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                        {inv.status === 'PAID' ? 'Đã thanh toán' : 'Chưa nộp'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1 space-y-6">
                                <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Số tiền của bạn</span>
                                    <span className="text-3xl font-black text-slate-800">
                                        {new Intl.NumberFormat('vi-VN').format(inv.amount)} đ
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <span className="text-xl">📅</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">Ngày phát hành</span>
                                            <span className="font-bold text-sm text-slate-700">{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <span className="text-xl">🏢</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">Mục đích</span>
                                            <span className="font-bold text-sm text-slate-700">Tiền điện & nước tháng {inv.month}</span>
                                        </div>
                                    </div>
                                </div>

                                {inv.status === 'UNPAID' ? (
                                    <div className="pt-4 space-y-3">
                                        <Button
                                            onClick={() => handlePayVNPay(inv)}
                                            disabled={payingId === inv.id}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 flex justify-center items-center gap-2"
                                        >
                                            {payingId === inv.id ? (
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>💳 Thanh toán VNPay</>
                                            )}
                                        </Button>
                                        <p className="text-[10px] text-center text-slate-400 font-medium">Thanh toán tự động qua cổng VNPay</p>
                                    </div>
                                ) : (
                                    <div className="pt-4">
                                        <div className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black uppercase tracking-widest text-center border border-emerald-100">
                                            ✅ Hoàn tất
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
