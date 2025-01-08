import React, { useState } from 'react';

interface User {
  user_id: number;
  profile_id: number;
  name: string;
  email: string;
  // 필요한 다른 필드들...
}

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
}

export default function UserSelectModal({ isOpen, onClose, onSelect }: UserSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCondition, setSearchCondition] = useState('name'); // 기본 검색 조건
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/user/search?${searchCondition}=${searchTerm}`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('사용자 검색 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">사용자 선택</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">검색 조건</label>
          <select
            value={searchCondition}
            onChange={(e) => setSearchCondition(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="name">이름</option>
            <option value="email">이메일</option>
            {/* 다른 검색 조건 추가 가능 */}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">검색어</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="검색어 입력..."
            />
            <button
              type="button"
              onClick={searchUsers}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              검색
            </button>
          </div>
        </div>

        {loading ? (
          <div>검색 중...</div>
        ) : (
          <div className="mb-4 max-h-40 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => onSelect(user)}
              >
                {user.name} - {user.email}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
} 