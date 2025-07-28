'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@repo/shared/types/models';

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
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    status: null,
    profile_name: '',
    email: '',
    mobile: '',
  });
  
  // 중복 호출 방지를 위한 ref
  const isFetching = useRef(false);

  const fetchUsers = async (pageNum: number, isNewSearch = false) => {
    if (isFetching.current) return; // 중복 호출 방지
    console.log('Fetching users...');
    isFetching.current = true;
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

      // 토큰 추출 (안전하게)
      const getToken = () => {
        try {
          const cookies = document.cookie.split(';');
          const adminTokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
          return adminTokenCookie ? adminTokenCookie.split('=')[1] : null;
        } catch (error) {
          console.error('Error extracting token:', error);
          return null;
        }
      };

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(`/admin/api/v1/users?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('data', data);

      // API 응답 구조에 따라 처리
      if (data.users || data.data) {
        const users = data.users || data.data;
        setUsers(prev => isNewSearch ? users : [...prev, ...users]);
        setHasMore(data.hasMore || data.meta?.pagination?.hasNext || false);
        setTotal(data.total || data.meta?.pagination?.total || 0);
      } else {
        throw new Error('응답 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : '이용자 목록을 불러오는데 실패했습니다.');
    } finally {
      console.log('Fetch complete');
      setLoading(false);
      isFetching.current = false;
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    setUsers([]);
    setTotal(0); // 필터 변경 시 total 초기화
    // fetchUsers 호출 제거 - useEffect에서 처리
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchUsers(page, page === 1);
  }, [page, filters]); // filters도 의존성에 추가

  const getStatusText = (status: number) => {
    switch (status) {
    case 0: return '정지';
    case 1: return '정상';
    case 2: return '탈퇴';
    default: return '알수없음';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="text-sm text-gray-600 mt-1">총 {total}명의 사용자</p>
        </div>
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
            <option value="0">정지</option>
            <option value="1">정상</option>
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
        {/* 데스크톱 테이블 */}
        <div className="hidden md:block">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.profile?.name || ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.profile?.email || ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 0 ? 'bg-green-100 text-green-800' :
                        user.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(user.status || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.created_at || '').toLocaleDateString()}
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

        {/* 모바일 카드 리스트 */}
        <div className="md:hidden">
          {users.map((user) => (
            <div key={user.id} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">ID: {user.id}</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 0 ? 'bg-green-100 text-green-800' :
                        user.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(user.status || 0)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">이름:</span> {user.profile?.name || '-'}
                    </div>
                    <div className="mb-1">
                      <span className="font-medium">이메일:</span> {user.profile?.email || '-'}
                    </div>
                    <div>
                      <span className="font-medium">생성일:</span> {new Date(user.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  상세보기
                </button>
              </div>
            </div>
          ))}
        </div>
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