'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@repo/ui/input';
import { useApi } from '@/hooks/useApi';

const API_ENDPOINT = '/api/v1/constants';

interface ConstantData {
  departments: any[];
  deviceTypes: any[];
  manufacturers: any[];
}

export default function ConstantsPage() {
  const [authToken, setAuthToken] = useState('');

  // localStorage에서 토큰 가져오기
  useEffect(() => {
    const storedToken = localStorage.getItem('client_token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  const { data, loading, error } = useApi<ConstantData>({
    url: API_ENDPOINT,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    enabled: !!authToken,
  });

  const renderContent = () => {
    if (loading) {
      return <p className="text-muted-foreground animate-pulse">Loading constants...</p>;
    }
    if (error) {
      return (
        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      );
    }
    if (data) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Departments</h2>
            <pre className="mt-2 p-4 bg-slate-50 border rounded-md text-sm overflow-x-auto text-slate-900">
              {JSON.stringify(data.departments, null, 2)}
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Device Types</h2>
            <pre className="mt-2 p-4 bg-slate-50 border rounded-md text-sm overflow-x-auto text-slate-900">
              {JSON.stringify(data.deviceTypes, null, 2)}
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Manufacturers</h2>
            <pre className="mt-2 p-4 bg-slate-50 border rounded-md text-sm overflow-x-auto text-slate-900">
              {JSON.stringify(data.manufacturers, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout title="Client API Test: Constants">
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

      <Card title="Constants API">
        <p className="text-sm text-gray-600 mb-4">
          Fetches and displays data from <code>{API_ENDPOINT}</code>.
        </p>
        {renderContent()}
      </Card>
    </PageLayout>
  );
} 