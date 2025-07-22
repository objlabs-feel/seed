'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/app/test/_contexts/AuthContext';

const adminPages = [
  { name: 'Login', path: '/test/admin/login' },
  // { name: 'Register', path: '/test/admin/register' }, // 등록 기능은 일단 비활성화
  { name: 'Data Management', path: '/test/admin/constants' },
  { name: 'System Environments', path: '/test/admin/system-environments' },
  { name: 'Product', path: '/test/admin/product' },
];

const unprotectedPaths = ['/test/admin/login', '/test/admin/register'];

export default function AdminTestLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // sessionStorage에서 토큰을 읽어오는 시간을 벌기 위해 초기 로드 상태를 잠시 유지
    const timer = setTimeout(() => setIsInitialLoad(false), 100); // 100ms 대기

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 초기 로딩 중이거나, 보호되지 않는 경로에 있는 경우 리디렉션 로직을 실행하지 않음
    if (isInitialLoad || unprotectedPaths.includes(pathname)) {
      return;
    }

    // 토큰이 없는 경우 로그인 페이지로 리디렉션
    if (!token) {
      router.push('/test/admin/login');
    }
  }, [pathname, token, isInitialLoad, router]);

  // 인증 상태 확인 중이거나 리디렉션이 필요한 경우
  if ((isInitialLoad || !token) && !unprotectedPaths.includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
        <p className="animate-pulse text-gray-800 dark:text-gray-200">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-gray-700">Admin Test Menu</div>
        <nav className="flex-grow">
          <ul>
            {adminPages.map((page) => (
              <li key={page.path}>
                <Link href={page.path}>
                  <div
                    className={`block p-4 hover:bg-gray-700 ${
                      pathname === page.path ? 'bg-gray-900' : ''
                    }`}
                  >
                    {page.name}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto bg-white dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}