'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  status: number;
  created_at: string;
}

interface SearchFilters {
  status: number | null;
  profile_name: string;
  email: string;
  mobile: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    status: null,
    profile_name: '',
    email: '',
    mobile: '',
  });

  const fetchUsers = async (pageNum: number, isNewSearch = false) => {
    if (loading) return; // 중복 호출 방지
    console.log('Fetching users...');
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filters.status !== null && { status: filters.status.toString() }),
        ...(filters.profile_name && { profile_name: filters.profile_name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.mobile && { mobile: filters.mobile })
      });

      const response = await fetch(`/api/v1/users?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Network response was not ok');
      }
      const data = await response.json();

      if (data.success && data.data) {
        setUsers(prev => isNewSearch ? data.data : [...prev, ...data.data]);
        setHasMore(data.meta?.pagination?.hasNext || false);
      } else {
        throw new Error(data.error?.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : '이용자 목록을 불러오는데 실패했습니다.');
    } finally {
      console.log('Fetch complete');
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    setUsers([]);
    fetchUsers(1, true);
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchUsers(page);
  }, [page]); // 의존성 배열에 page만 포함

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '정상';
      case 1: return '정지';
      case 2: return '탈퇴';
      default: return '알수없음';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <button
          onClick={() => router.push('/admin/users/register')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          신규 등록
        </button>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status?.toString() || ''}
            onChange={(e) => handleFilterChange({
              ...filters,
              status: e.target.value ? parseInt(e.target.value) : null
            })}
            className="border rounded p-2"
          >
            <option value="">전체 상태</option>
            <option value="0">정상</option>
            <option value="1">정지</option>
            <option value="2">탈퇴</option>
          </select>
          <input
            type="text"
            placeholder="이름 검색"
            value={filters.profile_name}
            onChange={(e) => handleFilterChange({
              ...filters,
              profile_name: e.target.value
            })}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="이메일 검색"
            value={filters.email}
            onChange={(e) => handleFilterChange({
              ...filters,
              email: e.target.value
            })}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="전화번호 검색"
            value={filters.mobile}
            onChange={(e) => handleFilterChange({
              ...filters,
              mobile: e.target.value
            })}
            className="border rounded p-2"
          />
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 0 ? 'bg-green-100 text-green-800' :
                    user.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 로딩 및 에러 상태 */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      )}

      {/* 더보기 버튼 */}
      {hasMore && !loading && (
        <div className="text-center mt-4">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
}