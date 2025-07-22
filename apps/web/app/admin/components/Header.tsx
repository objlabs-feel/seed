'use client';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm lg:static sticky top-0 z-10 text-gray-900">
      <div className="h-16 px-4 flex items-center justify-between">
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={onMenuClick}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">관리자 페이지</h1>
        <div className="flex items-center space-x-4">
          {/* 알림, 프로필 등 추가 가능 */}
        </div>
      </div>
    </header>
  );
}