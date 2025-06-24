'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/test/_contexts/AuthContext';
import { Button } from '@repo/ui/button';
import { SystemEnvironment } from '@repo/shared/models';

const API_ENDPOINT = '/admin/api/v1/system-environments';

export default function SystemEnvironmentPage() {
  const [environment, setEnvironment] = useState<SystemEnvironment | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      
      const data: SystemEnvironment[] = await response.json();
      const firstEnv = data[0];
      
      if (firstEnv) {
        setEnvironment(firstEnv);
        setJsonText(JSON.stringify(firstEnv.parameters, null, 2));
      } else {
        setEnvironment({ id: 0, parameters: {} });
        setJsonText('{}');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!token || !environment) return;

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (e) {
      alert('JSON 형식이 올바르지 않습니다.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const isCreating = !environment.id;
    const url = isCreating ? API_ENDPOINT : `${API_ENDPOINT}/${environment.id}`;
    const method = isCreating ? 'POST' : 'PUT';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parameters: parsedJson }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '저장에 실패했습니다.');
      }
      
      alert('성공적으로 저장되었습니다.');
      const updatedEnv = await response.json();
      setEnvironment(updatedEnv);
      setJsonText(JSON.stringify(updatedEnv.parameters, null, 2));

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderContent = () => {
    if (loading) return <p className="text-gray-500 animate-pulse">Loading settings...</p>;
    if (error) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      );
    }

    return (
      <>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm bg-background text-foreground border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter valid JSON..."
        />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || !environment}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
          >
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">System Environments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        시스템의 환경 변수를 JSON 형식으로 수정합니다.
      </p>
      
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
} 