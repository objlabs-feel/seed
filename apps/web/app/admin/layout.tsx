'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로그인 페이지는 검증 스킵
        if (pathname === '/admin/login') {
          setIsLoading(false);
          return;
        }

        // 쿠키에서 토큰 추출
        const cookies = document.cookie.split(';');
        const adminTokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
        const token = adminTokenCookie ? adminTokenCookie.split('=')[1] : null;

        if (!token) {
          throw new Error('토큰이 없습니다');
        }

        const response = await fetch('/admin/api/v1/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('인증 실패');
        }

        setIsLoading(false);
      } catch (error) {
        // 로그인 페이지가 아닌 경우에만 리다이렉트
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    };

    checkAuth();
  }, [pathname]);

  // 로그인 페이지일 경우 레이아웃 없이 컨텐츠만 표시
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-900">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-900">
      {/* 모바일 사이드바 오버레이 */}
      <div className={`
        fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity z-20
        lg:hidden
        ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setSidebarOpen(false)} />

      {/* 사이드바 */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 overflow-x-auto">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}