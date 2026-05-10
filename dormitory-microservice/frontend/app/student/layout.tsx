'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInitials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header for Student (Top navigation is usually better for end-users) */}
      <header className="h-16 bg-[var(--color-ptit-red)] text-white shadow-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wider">PTIT DORMITORY</div>
          <nav className="hidden md:flex ml-10 space-x-1">
            <Link href="/student" className="px-4 py-2 rounded-md hover:bg-white/10 transition font-medium">Trang chủ</Link>
            <Link href="/student/rooms" className="px-4 py-2 rounded-md hover:bg-white/10 transition font-medium">Đăng ký phòng</Link>
            <Link href="/student/stays" className="px-4 py-2 rounded-md hover:bg-white/10 transition font-medium">Phòng của tôi</Link>
            <Link href="/student/payments" className="px-4 py-2 rounded-md hover:bg-white/10 transition font-medium">Thanh toán</Link>
            <Link href="/student/complaints" className="px-4 py-2 rounded-md hover:bg-white/10 transition font-medium">Phản ánh</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-md transition">
            <div className="w-8 h-8 rounded-full bg-white text-[var(--color-ptit-red)] flex items-center justify-center font-bold">
              {userInitials}
            </div>
            <span className="hidden sm:block font-medium">{user?.fullName || user?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-100 hover:text-white px-2 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
