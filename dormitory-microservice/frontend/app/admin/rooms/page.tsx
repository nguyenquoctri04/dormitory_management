import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Phòng Ký túc xá</h2>
        <Button variant="primary">+ Thêm phòng mới</Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách phòng</CardTitle>
            <input 
              type="text" 
              placeholder="Tìm kiếm phòng..." 
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-600 bg-slate-50">
                  <th className="py-3 px-4 font-medium">Mã phòng</th>
                  <th className="py-3 px-4 font-medium">Loại phòng</th>
                  <th className="py-3 px-4 font-medium">Sức chứa</th>
                  <th className="py-3 px-4 font-medium">Đang ở</th>
                  <th className="py-3 px-4 font-medium">Giới tính</th>
                  <th className="py-3 px-4 font-medium">Trạng thái</th>
                  <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock Data Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">A1-101</td>
                  <td className="py-3 px-4 text-slate-600">Phòng 8 người (Tiêu chuẩn)</td>
                  <td className="py-3 px-4 text-slate-600">8</td>
                  <td className="py-3 px-4 font-medium text-blue-600">6</td>
                  <td className="py-3 px-4 text-slate-600">Nam</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Hoạt động</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-blue-500 hover:text-blue-700 mr-3 text-sm font-medium">Sửa</button>
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium">Xóa</button>
                  </td>
                </tr>
                {/* Mock Data Row 2 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">B2-205</td>
                  <td className="py-3 px-4 text-slate-600">Phòng 4 người (Dịch vụ)</td>
                  <td className="py-3 px-4 text-slate-600">4</td>
                  <td className="py-3 px-4 font-medium text-red-600">4</td>
                  <td className="py-3 px-4 text-slate-600">Nữ</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Đã đầy</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-blue-500 hover:text-blue-700 mr-3 text-sm font-medium">Sửa</button>
                    <button className="text-red-500 hover:text-red-700 text-sm font-medium">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
            <div>Hiển thị 1-2 trên 120 phòng</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Trước</Button>
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Tiếp</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
