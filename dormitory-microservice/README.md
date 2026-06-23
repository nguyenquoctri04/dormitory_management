# Hệ Thống Quản Lý Ký Túc Xá (Dormitory Management System)

Chào mừng bạn đến với hệ thống quản lý ký túc xá được xây dựng trên kiến trúc **Microservices**. Hệ thống bao gồm một bộ backend mạnh mẽ sử dụng Node.js, Prisma, MySQL và một frontend hiện đại sử dụng React + Vite.

## 🏗 Kiến Trúc Hệ Thống

Hệ thống được chia thành nhiều dịch vụ nhỏ (microservices) để đảm bảo tính mở rộng và dễ dàng bảo trì:

- **API Gateway (8080):** Điểm đầu vào duy nhất cho mọi yêu cầu từ frontend, chịu trách nhiệm định tuyến và xác thực JWT.
- **Auth Service (3001):** Quản lý đăng ký, đăng nhập và cấp phát Token (Access & Refresh).
- **Student Service (3002):** Quản lý thông tin hồ sơ sinh viên.
- **Room Service (3003):** Quản lý thông tin phòng, loại phòng và tình trạng phòng.
- **Registration Service (3004):** Xử lý việc đăng ký phòng của sinh viên.
- **Payment Service (3005):** Quản lý hóa đơn và thanh toán.
- **Complaint Service (3006):** Tiếp nhận và xử lý khiếu nại/báo hỏng.
- **Utility Service (3007):** Quản lý điện, nước và các dịch vụ tiện ích.

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

- [Docker](https://www.docker.com/products/docker-desktop/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (Phiên bản 18 trở lên)
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)

---

## 🚀 Hướng Dẫn Chạy Hệ Thống

### 1. Khởi chạy Backend (Docker)

Toàn bộ backend (bao gồm database và các dịch vụ) đã được cấu hình để chạy bằng Docker Compose.

1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd dormitory-microservice/backend
   ```

2. Khởi chạy tất cả các dịch vụ:
   ```bash
   docker-compose up --build -d
   ```
   *Lưu ý: Lần đầu tiên chạy có thể mất vài phút để tải image và cài đặt dependencies.*

3. Kiểm tra trạng thái các container:
   ```bash
   docker-compose ps
   ```
   Đảm bảo tất cả các dịch vụ đều ở trạng thái `running` hoặc `healthy`.

### 2. Khởi chạy Frontend

Sau khi backend đã chạy ổn định, bạn có thể khởi chạy giao diện người dùng.

1. Mở một terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd dormitory-microservice/frontend
   ```

2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

3. Khởi chạy server phát triển:
   ```bash
   npm run dev
   ```

4. Truy cập vào địa chỉ: `http://localhost:5173` để sử dụng ứng dụng.

---

## 🛠 Cấu Hình Cơ Sở Dữ Liệu

- Hệ thống sử dụng **MySQL 8.0**.
- Cổng kết nối bên ngoài: `3307` (Dùng để kết nối từ các công cụ như MySQL Workbench hoặc DBeaver).
- Dữ liệu được lưu trữ trong Docker Volume `mysql_data` để đảm bảo không bị mất khi restart container.
- Mỗi dịch vụ có database riêng (ví dụ: `auth_db`, `student_db`, ...) để tuân thủ kiến trúc Microservices.

## 📝 Các Endpoint Quan Trọng

- **API Gateway:** `http://localhost:8080`
- **Tài liệu API:** (Nếu có Swagger, hãy truy cập `http://localhost:8080/docs` - *Cần cấu hình thêm*)

## ⚠️ Giải Quyết Sự Cố

- **Lỗi cổng 3307 đã bị chiếm dụng:** Kiểm tra xem bạn có đang chạy MySQL trên máy thật không. Nếu có, hãy tắt nó hoặc đổi cổng trong `docker-compose.yml`.
- **Lỗi kết nối Database:** Các dịch vụ sẽ chờ MySQL khởi động hoàn toàn trước khi chạy `prisma db push`. Nếu gặp lỗi, hãy thử chạy `docker-compose restart <tên-dịch-vụ>`.
- **Lỗi xác thực JWT:** Đảm bảo `JWT_SECRET` đồng nhất giữa `api-gateway` và `auth-service` trong tệp `docker-compose.yml`.

---
⚡ *Chúc bạn có trải nghiệm tuyệt vời với hệ thống!*
