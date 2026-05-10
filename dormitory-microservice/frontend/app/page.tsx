'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { useAuthContext } from "@/components/providers/AuthProvider";
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[var(--color-ptit-red)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">PTIT</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-[var(--color-ptit-red)]">Hệ thống Ký túc xá</CardTitle>
          <p className="text-slate-500 mt-2 text-sm">Quản lý Ký túc xá Học viện PTIT</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full" variant="primary">Đăng nhập</Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">hoặc</span>
              </div>
            </div>
            <Link href="/register" className="block">
              <Button className="w-full" variant="outline">Đăng ký tài khoản mới</Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-slate-600 text-center">
            Hệ thống này dành cho quản lý ký túc xá của Học viện Công nghệ Bưu chính Viễn thông
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
