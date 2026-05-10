'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    : user?.email.charAt(0).toUpperCase() || 'A';

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 bg-[var(--color-ptit-red)] font-bold text-xl flex items-center justify-center">
          PTIT ADMIN
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            Tổng quan
          </Link>
          <Link href="/admin/rooms" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            Quản lý Phòng
          </Link>
          <Link href="/admin/students" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            Sinh viên
          </Link>
          <Link href="/admin/registrations" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            Đơn đăng ký
          </Link>
          <Link href="/admin/payments" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            Thanh toán & Hóa đơn
          </Link>
          <Link href="/admin/complaints" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
            Khiếu nại
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-slate-800">Bảng điều khiển</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">{user?.fullName || user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-[var(--color-ptit-yellow)] flex items-center justify-center text-slate-900 font-bold">
              {userInitials}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
