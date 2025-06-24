'use client';

import { useState } from 'react';

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: any) => void;
}

export default function UserSelectModal({ isOpen, onClose, onSelect }: UserSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCondition, setSearchCondition] = useState('name'); // 기본 검색 조건
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async () => {
    if (!searchTerm) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/user/search?${searchCondition}=${searchTerm}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '사용자 검색 중 오류가 발생했습니다.');
      }
      const data = await response.json();

      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        throw new Error(data.error?.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('사용자 검색 중 오류:', err);
      setError(err instanceof Error ? err.message : '사용자 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">사용자 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <select
              value={searchCondition}
              onChange={(e) => setSearchCondition(e.target.value)}
              className="border rounded p-2"
            >
              <option value="name">이름</option>
              <option value="email">이메일</option>
              <option value="mobile">전화번호</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 border rounded p-2"
            />
            <button
              onClick={searchUsers}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-1">
              {error}
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.mobile}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => {
                          onSelect(user);
                          onClose();
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        선택
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {loading ? '검색 중...' : '검색 결과가 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}