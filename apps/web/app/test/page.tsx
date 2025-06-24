'use client';

import Link from 'next/link';

const testPages = {
  client: [
    { href: '/test/client/auth', title: 'Auth API', description: '사용자 인증 (Check-in, Verify, Check-out)을 테스트합니다.' },
    { href: '/test/client/users', title: 'Users API', description: '사용자 정보 조회, 수정, 비활성화를 테스트합니다.' },
    { href: '/test/client/saleitems', title: 'SaleItems API', description: '판매 아이템(경매 포함) 생성 및 조회를 테스트합니다.' },
    { href: '/test/client/constants', title: 'Constants API', description: '상수 데이터(부서, 장치 유형 등) 조회를 테스트합니다.' },
  ],
  admin: [
    { href: '/test/admin/login', title: 'Admin Login API', description: '관리자 로그인을 테스트합니다.' },
    { href: '/test/admin/register', title: 'Admin Register API', description: '관리자 계정을 생성합니다.' },
    { href: '/test/admin/users', title: 'Users API', description: '관리자용 사용자 정보 조회를 테스트합니다.' },
    { href: '/test/admin/companies', title: 'Companies API', description: '관리자용 회사 정보 조회를 테스트합니다.' },
    { href: '/test/admin/products', title: 'Products API', description: '관리자용 상품 정보 조회를 테스트합니다.' },
    { href: '/test/admin/constants', title: 'Constants API', description: '상수 값 조회를 테스트합니다.' },
    { href: '/test/admin/system-environments', title: 'SystemEnvironments API', description: '시스템 환경변수 조회를 테스트합니다.' },
  ],
};

const Card = ({ href, title, description }: { href: string; title: string; description: string }) => (
  <Link href={href}>
    <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>
    </div>
  </Link>
);

export default function TestIndexPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">API 테스트 페이지 목록</h1>
      
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800 dark:text-gray-200 dark:border-gray-700">Client APIs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testPages.client.map((page) => (
              <Card key={page.href} {...page} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800 dark:text-gray-200 dark:border-gray-700">Admin APIs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testPages.admin.map((page) => (
              <Card key={page.href} {...page} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 