import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Xin chào, Nguyễn Văn A!</h2>
          <p className="text-slate-500 mt-1">Mã SV: B21DCCN123 | Lớp: D21CQCN01-B</p>
        </div>
        <Link href="/student/rooms">
          <Button variant="primary">Đăng ký phòng mới</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Current Stay Status */}
        <Card className="border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Thông tin lưu trú hiện tại</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Đang lưu trú</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Phòng</span>
              <span className="font-semibold text-slate-800">A1-101 (Tòa A1)</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Kỳ lưu trú</span>
              <span className="font-medium text-slate-800">Kỳ 1 (2025-2026)</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Loại phòng</span>
              <span className="font-medium text-slate-800">Tiêu chuẩn (8 người)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hạn hợp đồng</span>
              <span className="font-medium text-slate-800">30/01/2026</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full">Xem chi tiết phòng</Button>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card className="border-t-4 border-t-[var(--color-ptit-red)]">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Hóa đơn cần thanh toán</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">1 hóa đơn nợ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-800">Tiền điện nước tháng 04/2026</h4>
                  <p className="text-sm text-slate-500">Hạn thanh toán: 15/05/2026</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--color-ptit-red)] text-lg">150.000đ</div>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full mt-3">Thanh toán ngay</Button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <Link href="/student/payments" className="text-sm text-blue-600 hover:underline">
                Xem lịch sử thanh toán
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile completion warning if needed */}
      <Card className="bg-yellow-50 border border-yellow-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              !
            </div>
            <div>
              <h4 className="font-medium text-slate-800">Hồ sơ chưa hoàn thiện</h4>
              <p className="text-sm text-slate-600">Vui lòng cập nhật đầy đủ thông tin để sử dụng các dịch vụ tốt nhất.</p>
            </div>
          </div>
          <Button variant="secondary">Cập nhật hồ sơ</Button>
        </CardContent>
      </Card>
    </div>
  );
}
