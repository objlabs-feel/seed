'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: number
  name: string
  email: string
  mobile: string
}

interface User {
  id: number
  profile_id: number
  status: number
  created_at: string
  profile: Profile
}

interface SearchFilters {
  status: number | null
  profile_name: string
  email: string
  mobile: string
}

export default function UserManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({
    status: null,
    profile_name: '',
    email: '',
    mobile: ''
  })

  // 무한 스크롤을 위한 observer
  const observer = useRef<IntersectionObserver>()
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    
    if (node) {
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1)
        }
      })
      observer.current.observe(node)
    }
  }, [loading, hasMore])

  const fetchUsers = async (pageNum: number, isNewSearch = false) => {
    if (loading) return; // 중복 호출 방지
    console.log('Fetching users...');
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filters.status !== null && { status: filters.status.toString() }),
        ...(filters.profile_name && { profile_name: filters.profile_name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.mobile && { mobile: filters.mobile })
      })
  
      const response = await fetch(`/api/v1/users?${queryParams}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      
      if (data.users) {
        setUsers(prev => isNewSearch ? data.users : [...prev, ...data.users])
        setHasMore(data.hasMore)
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('이용자 목록을 불러오는데 실패했습니다.')
    } finally {
      console.log('Fetch complete');
      setLoading(false) // 로딩 상태 업데이트
    }
  }

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setPage(1)
    setUsers([])
    fetchUsers(1, true)
  }

  useEffect(() => {
    console.log('useEffect triggered');
    fetchUsers(page)
  }, [page]) // 의존성 배열에 page만 포함

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '정상'
      case 1: return '정지'
      case 2: return '탈퇴'
      default: return '알수없음'
    }
  }

  const getProfileTypeText = (profile_type: number) => {
    switch (profile_type) {
      case 0: return '병원장'
      case 1: return '기업'
      case 2: return '관계자'
      case 3: return '기관'
      default: return '알수없음'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">이용자 관리</h2>
          <button
            onClick={() => router.push('/admin/users/register')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            이용자 추가
          </button>
        </div>

        {/* 검색 필터 */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="이름"
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, profile_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="이메일"
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="전화번호"
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, mobile: e.target.value })}
          />
          <select
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, status: parseInt(e.target.value) })}
          >
            <option value="">상태 선택</option>
            <option value="0">정상</option>
            <option value="1">정지</option>
            <option value="2">탈퇴</option>
          </select>
        </div>

        {/* 이용자 목록 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium text-gray-500">ID</th>
                <th className="p-4 text-left font-medium text-gray-500">이름</th>
                <th className="p-4 text-left font-medium text-gray-500">이메일</th>
                <th className="p-4 text-left font-medium text-gray-500">전화번호</th>
                <th className="p-4 text-left font-medium text-gray-500">가입일</th>
                <th className="p-4 text-left font-medium text-gray-500">상태</th>
                <th className="p-4 text-left font-medium text-gray-500">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr 
                  key={user.id}
                  ref={index === users.length - 1 ? lastItemRef : null}
                  className="hover:bg-gray-50"
                >
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.profile?.name}</td>
                  <td className="p-4">{user.profile?.email}</td>
                  <td className="p-4">{user.profile?.mobile}</td>
                  <td className="p-4">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.status === 0 ? 'bg-green-100 text-green-800' :
                      user.status === 1 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="text-center py-4">로딩 중...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
      </div>
    </div>
  )
} 