'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@repo/ui/input';
import { Button } from '@repo/ui/button';
import { useApi } from '@/hooks/useApi';

interface UserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateUserData {
  email?: string;
  phone?: string;
  department?: string;
}

export default function UsersPage() {
  const [authToken, setAuthToken] = useState('');
  const [userId, setUserId] = useState('');
  const [updateData, setUpdateData] = useState<UpdateUserData>({
    email: '',
    phone: '',
    department: '',
  });

  // localStorage에서 토큰 가져오기
  useEffect(() => {
    const storedToken = localStorage.getItem('client_token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  // 내 정보 불러오기
  const { data: myData, loading: myLoading, error: myError, refetch: refetchMyData } = useApi<UserData>({
    url: '/api/v1/users/me',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    enabled: !!authToken,
  });

  // 내 판매목록 불러오기
  const { data: mySaleItems, loading: mySaleItemsLoading, error: mySaleItemsError } = useApi<any>({
    url: myData ? `/api/v1/users/${myData.id}/saleitems` : '',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    enabled: !!authToken && !!myData,
  });

  // 내 뷰히스토리 불러오기
  const { data: myViewHistory, loading: myViewHistoryLoading, error: myViewHistoryError } = useApi<any>({
    url: myData ? `/api/v1/users/${myData.id}/viewhistory` : '',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    enabled: !!authToken && !!myData,
  });

  // 특정 사용자 정보 불러오기
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUserData } = useApi<UserData>({
    url: userId ? `/api/v1/users/${userId}` : '',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    enabled: !!authToken && !!userId,
  });

  // 사용자 정보 수정
  const handleUpdateUser = async () => {
    if (!authToken) return;

    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // 데이터 새로고침
      refetchMyData();
      alert('사용자 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      alert('사용자 정보 수정에 실패했습니다.');
      console.error('Update error:', error);
    }
  };

  // 계정 비활성화
  const handleDeactivateAccount = async () => {
    if (!authToken || !confirm('정말로 계정을 비활성화하시겠습니까?')) return;

    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate account');
      }

      alert('계정이 비활성화되었습니다.');
      localStorage.removeItem('client_token');
      window.location.href = '/test/client/auth';
    } catch (error) {
      alert('계정 비활성화에 실패했습니다.');
      console.error('Deactivate error:', error);
    }
  };

  const renderMyData = () => {
    if (myLoading) {
      return <p className="text-slate-900 animate-pulse">내 정보 불러오는 중...</p>;
    }
    if (myError) {
      return (
        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{myError}</p>
        </div>
      );
    }
    if (myData) {
      return (
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2 text-slate-900">현재 정보</h3>
            <pre className="whitespace-pre-wrap text-slate-900">{JSON.stringify(myData, null, 2)}</pre>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2 text-slate-900">내 판매목록</h3>
            {mySaleItemsLoading ? (
              <div className="text-slate-900">로딩 중...</div>
            ) : mySaleItemsError ? (
              <div className="text-red-500">에러: {mySaleItemsError}</div>
            ) : mySaleItems ? (
              <pre className="whitespace-pre-wrap text-slate-900">{JSON.stringify(mySaleItems, null, 2)}</pre>
            ) : (
              <div className="text-slate-900">판매목록이 없습니다.</div>
            )}
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2 text-slate-900">내 뷰히스토리</h3>
            {myViewHistoryLoading ? (
              <div className="text-slate-900">로딩 중...</div>
            ) : myViewHistoryError ? (
              <div className="text-red-500">에러: {myViewHistoryError}</div>
            ) : myViewHistory ? (
              <pre className="whitespace-pre-wrap text-slate-900">{JSON.stringify(myViewHistory, null, 2)}</pre>
            ) : (
              <div className="text-slate-900">조회 이력이 없습니다.</div>
            )}
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2 text-slate-900">정보 수정</h3>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="이메일"
                value={updateData.email}
                onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="전화번호"
                value={updateData.phone}
                onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
              />
              <Input
                type="text"
                placeholder="부서"
                value={updateData.department}
                onChange={(e) => setUpdateData({ ...updateData, department: e.target.value })}
              />
              <Button onClick={handleUpdateUser} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                정보 수정
              </Button>
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2 text-slate-900">계정 관리</h3>
            <Button onClick={handleDeactivateAccount} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              계정 비활성화
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderUserData = () => {
    if (!userId) return null;
    if (userLoading) {
      return <p className="text-slate-900 animate-pulse">사용자 정보 불러오는 중...</p>;
    }
    if (userError) {
      return (
        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{userError}</p>
        </div>
      );
    }
    if (userData) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-slate-900">사용자 정보</h3>
          <pre className="mt-2 p-4 bg-slate-50 border rounded-md text-sm overflow-x-auto text-slate-900">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout title="Client API Test: Users">
      <Card title="인증 토큰 (선행 필요)">
        <p className="text-sm text-gray-600 mb-2">
          이 페이지의 API 호출을 위해 'Client API Test: Auth' 페이지에서 Check-in을 완료하고 받은 JWT 토큰이 필요합니다.
        </p>
        <Input
          type="text"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder="Auth 페이지에서 복사한 토큰을 여기에 붙여넣으세요"
        />
      </Card>

      <Card title="내 정보 관리">
        <p className="text-sm text-gray-600 mb-4">
          내 정보를 조회하고 수정할 수 있습니다.
        </p>
        {renderMyData()}
      </Card>

      <Card title="사용자 정보 조회">
        <p className="text-sm text-gray-600 mb-4">
          사용자 ID를 입력하여 해당 사용자의 정보를 조회할 수 있습니다.
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="사용자 ID를 입력하세요"
          />
        </div>
        {renderUserData()}
      </Card>
    </PageLayout>
  );
}