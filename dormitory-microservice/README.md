# 🏨 Dormitory Microservice Management System

Hệ thống quản lý ký túc xá toàn diện được thiết kế theo kiến trúc **Microservices**, tập trung vào tính tự động hóa, hiệu năng cao và trải nghiệm người dùng hiện đại.

---

## 💻 Công Nghệ Cốt Lõi (Tech Stack)

### **Backend (Microservices)**

- **Runtime:** Node.js v18+ (Express Framework)
- **Database:** MongoDB (Kiến trúc Database-per-Service)
- **ORM:** Prisma v5.22.0
- **API Gateway:** Dựa trên `http-proxy-middleware`, xử lý Routing và Authentication (JWT) tập trung.
- **Xác thực:** JWT (Access Token & Refresh Token), Bcrypt (mã hóa mật khẩu).
- **Giao tiếp:** REST API (JSON), Axios (inter-service communication).
- **Deployment:** Docker & Docker Compose.

### **Frontend**

- **Framework:** React.js (với Vite)
- **Ngôn ngữ:** TypeScript (TypeScript-first)
- **Styling:** TailwindCSS & Custom Vanilla CSS (Dark mode optimized, Glassmorphism).
- **Quản lý trạng thái:** React Hooks (useState, useEffect, useContext).

---

## 🏗 Kiến Trúc Hệ Thống (7+1 Services)

Tất cả các dịch vụ được đóng gói bằng Docker và kết nối qua Docker Network.

1.  **API Gateway (Port 8080):**
    - Cổng duy nhất tiếp nhận Request.
    - Xử lý Proxying sang các dịch vụ nội bộ.
    - Kiểm thực JWT tại lớp Gateway để bảo vệ mọi endpoint `secure: true`.
2.  **Auth Service (Port 3001):**
    - Quản lý User (Student, Staff, Admin).
    - Đăng nhập, Đăng ký và Quản lý phiên làm việc.
3.  **Student Service (Port 3002):**
    - Quản lý hồ sơ chi tiết (Họ tên, SĐT, MSSV...).
4.  **Room Service (Port 3003):**
    - Quản lý Phòng (Room), Loại phòng (Normal/Premium), Sức chứa.
    - Quản lý bản ghi cư trú (**Stays** - Trạng thái: ACTIVE, ENDED, LEFT_EARLY).
5.  **Registration Service (Port 3004):**
    - Xử lý đơn đăng ký phòng.
    - Quản lý trạng thái đơn (PENDING, APPROVED, REJECTED).
6.  **Payment Service (Port 3005):**
    - Quản lý Hóa đơn (Invoices) và Thanh toán (Payments).
7.  **Complaint Service (Port 3006):**
    - Tiếp nhận báo hỏng và khiếu nại (PENDING, IN_PROGRESS, RESOLVED).
8.  **Utility Service (Port 3007):**
    - Theo dõi chỉ số điện/nước hàng tháng.

---

## ⚡ Các Quy Tắc Nghiệp Vụ Đặc Thù (Business Logic)

### **1. Tự Động Hóa Học Kỳ (Registration Automation)**

Hệ thống tự động xác định bối cảnh đăng ký dựa trên ngày hiện tại của máy chủ:

- **Học kỳ 1:** 15/08 - 14/01 (Năm học bắt đầu).
- **Học kỳ 2:** 15/01 - 14/06.
- **Học kỳ Hè:** 15/06 - 14/08.
- _Ví dụ:_ Ngày 23/06/2026 sẽ được hệ thống định danh là **Học kỳ Hè** của năm học **2025-2026**.

### **2. Quản Lý Sức Chứa (Occupancy Management)**

- Số lượng chỗ trống của phòng được tính toán dựa trên các bản ghi cư trú có trạng thái `ACTIVE` trong `Room Service`.
- Khi ban quản lý `APPROVE` đơn đăng ký, một bản ghi `Stay` sẽ tự động được tạo, làm giảm số lượng giường trống ngay lập tức.

### **3. Giao Diện Người Dùng (UI/UX)**

- **Room Status Bar:** Thanh trạng thái sử dụng gradient tùy theo loại phòng. Phần lấp đầy hiển thị bằng màu trắng (white filler).
- **Residency Dashboard:** Phân tách rõ ràng giữa cư trú đang hoạt động và lịch sử đã kết thúc.
- **Registration History:** Hiển thị lý do từ chối cụ thể cho sinh viên nếu đơn không được chấp nhận.

---

## 🛠 Hướng Dẫn Vận Hành

### **Backend (Docker)**

```bash
cd backend
docker-compose up --build -d
```

_Lưu ý: Đảm bảo cổng 8080 và 3001-3007 không bị chiếm dụng._

### **Frontend**

```bash
cd frontend
npm install
npm run dev
```

Giao diện sẽ chạy tại `http://localhost:5173`.

---

## 📂 Cơ Cấu Dữ Liệu

Mỗi dịch vụ Microservice sở hữu cơ sở dữ liệu MongoDB riêng biệt để đảm bảo tính độc lập hoàn toàn (Loose Coupling), tuân thủ nghiêm ngặt nguyên tắc thiết kế Microservices.

---

⚡ _Hệ thống được phát triển với tinh thần tối ưu hóa quy trình quản lý ký túc xá bằng công nghệ hiện đại._
