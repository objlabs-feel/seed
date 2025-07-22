'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card } from '@/components/ui/Card';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

export default function AdminCompaniesTestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setData(null);
    setError(null);
    try {
      const res = await fetch('/admin/api/v1/companies');
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch companies');
      }
      setData(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <PageLayout title="Admin API Test: Companies">
      <Card title="GET /admin/api/v1/companies">
        <p className="text-gray-600 mb-4">
          전체 회사 목록을 조회하는 API입니다.
        </p>
        <button
          onClick={fetchCompanies}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          회사 목록 조회
        </button>

        {data && <ResultDisplay type="info" title="Response:" data={data} />}
        {error && <ResultDisplay type="error" title="Error:" data={error} />}
      </Card>
    </PageLayout>
  );
}