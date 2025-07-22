import Link from 'next/link';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-md text-gray-900">
      <nav className="mt-10">
        <Link href="/admin" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          대시보드
        </Link>
        <Link href="/admin/products" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          경매상품 관리
        </Link>
        {/* 이용자 관리 */}
        <Link href="/admin/users" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          이용자 관리
        </Link>
        {/* 고객관리 */}
        <Link href="/admin/companies" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          업체 관리
        </Link>
        {/* 고객관리 */}
        <Link href="/admin/helpdesk" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          상담센터
        </Link>
        {/* 알림 관리 */}
        <Link href="/admin/notifications" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          알림 관리
        </Link>
        {/* 약관 관리 */}
        <Link href="/admin/terms" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          약관 관리
        </Link>
        <Link href="/admin/settings" className="flex items-center px-6 py-2 hover:bg-gray-100 text-gray-900">
          시스템 설정
        </Link>
      </nav>
    </aside>
  );
}