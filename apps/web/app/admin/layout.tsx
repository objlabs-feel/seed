'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // // 쿠키에서 로그인 상태 확인
    // const isLoggedIn = document.cookie.includes('admin_token')
    // // const isLoggedIn = true

    // // 로그인 페이지가 아니고, 로그인되지 않은 경우
    // if (!isLoggedIn && pathname !== '/admin/login') {
    //   router.push('/admin/login')
    // }
    // // 로그인 되어있는데 로그인 페이지에 접근하는 경우
    // else if (isLoggedIn && pathname === '/admin/login') {
    //   router.push('/admin')
    // }
  }, [pathname]);

  //   // 로그인 페이지일 경우 사이드바와 헤더를 표시하지 않음
  //   if (pathname === '/admin/login') {
  //     return <>{children}</>
  //   }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}