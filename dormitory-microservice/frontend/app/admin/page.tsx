import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h2>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[var(--color-ptit-red)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng số phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">120</div>
            <p className="text-xs text-green-600 mt-1">15 phòng còn trống</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[var(--color-ptit-yellow)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Sinh viên đang ở</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">850</div>
            <p className="text-xs text-slate-500 mt-1">/ Tối đa 960</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đơn chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">24</div>
            <p className="text-xs text-blue-500 mt-1">Cần xử lý ngay</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Hóa đơn chưa thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">45</div>
            <p className="text-xs text-slate-500 mt-1">Kỳ tháng 5/2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity or tables could go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Đơn đăng ký mới nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-500 py-8">
              Chưa có dữ liệu. Vui lòng kết nối API.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khiếu nại cần xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-500 py-8">
              Chưa có dữ liệu. Vui lòng kết nối API.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
