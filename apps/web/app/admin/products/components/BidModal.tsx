'use client';

import { useState } from 'react';
import { IUser } from '@repo/shared/models';

interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userId: number, value: number) => void
}

export default function BidModal({ isOpen, onClose, onSubmit }: BidModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [value, setValue] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/user/search?term=${searchTerm}`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('사용자 검색 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !value) return;

    onSubmit(selectedUser.id, Number(value));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">입찰하기</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">이용자 검색</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="이용자 검색..."
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
                  key={user.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  {/* 사용자 정보 표시 (프로필에 따라 수정) */}
                  User ID: {user.id}
                </div>
              ))}
            </div>
          )}

          {selectedUser && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">입찰가</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!selectedUser || !value}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
            >
              입찰하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}