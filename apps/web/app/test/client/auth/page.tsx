'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card } from '@/components/ui/Card';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { Input } from '@repo/ui/input';

interface User {
  id: string;
  // other user properties can be added here
}

interface CheckinResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  meta: {
    timestamp: number;
    path: string;
  };
}

export default function ClientAuthTestPage() {
  const [deviceToken, setDeviceToken] = useState('');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  const [checkinResult, setCheckinResult] = useState<CheckinResponse | string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<string | object | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | object | null>(null);

  const [loading, setLoading] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Token');

  useEffect(() => {
    const storedToken = localStorage.getItem('deviceToken');
    if (storedToken) {
      setDeviceToken(storedToken);
    }
  }, []);

  const generateUUID = () => {
    const newUUID = uuidv4();
    setDeviceToken(newUUID);
    localStorage.setItem('deviceToken', newUUID);
  };

  const clearResults = () => {
    setCheckinResult(null);
    setCheckoutResult(null);
    setVerifyResult(null);
    setUser(null);
    setJwtToken('');
  };

  const handleCheckin = async () => {
    if (!deviceToken) {
      setCheckinResult('Error: Device token is required.');
      return;
    }
    setLoading(true);
    clearResults();

    try {
      const response = await fetch('/api/v1/auth/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_token: deviceToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Check-in failed');

      setCheckinResult(data);
      setUser(data.data.user);
      setJwtToken(data.data.token);
      localStorage.setItem('client_token', data.data.token);
      console.log('Token saved:', data.data.token);  // 토큰 저장 확인
      console.log('Stored token:', localStorage.getItem('client_token'));  // 저장된 토큰 확인
      setCopyButtonText('Copy Token');
    } catch (error) {
      setCheckinResult(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!jwtToken) {
      setCheckoutResult('Error: Not checked in or JWT token is missing.');
      return;
    }
    setLoading(true);
    setCheckoutResult(null);
    setVerifyResult(null);

    try {
      const response = await fetch('/api/v1/auth/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed');

      setCheckoutResult(data);
      setUser(null);
      setJwtToken('');
      localStorage.removeItem('client_token');  // 체크아웃 시 토큰 삭제
    } catch (error) {
      setCheckoutResult(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!jwtToken) {
      setVerifyResult('Error: Not checked in or JWT token is missing.');
      return;
    }
    setLoading(true);
    setVerifyResult(null);

    try {
      const response = await fetch('/api/v1/auth/verify', {
        headers: { 'Authorization': `Bearer ${jwtToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verify failed');

      setVerifyResult(data);
    } catch (error) {
      setVerifyResult(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Token'), 2000);
    }
  };

  return (
    <PageLayout title="Client API Test: Auth">
      <Card title="Auth Flow (Device Token)">
        <div className="space-y-4">
          <div>
            <label htmlFor="deviceToken" className="block text-sm font-medium text-gray-700">
              Device Token (UUID)
            </label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="deviceToken"
                type="text"
                placeholder="Enter or generate a UUID"
                value={deviceToken}
                onChange={(e) => setDeviceToken(e.target.value)}
                className="w-full"
              />
              <button
                type="button"
                onClick={generateUUID}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 whitespace-nowrap"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleCheckin}
              disabled={loading || !deviceToken}
              className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? '...' : '1. Check-In'}
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading || !jwtToken}
              className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? '...' : '2. Check-Out'}
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || !jwtToken}
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? '...' : '3. Verify'}
            </button>
          </div>
        </div>

        {checkinResult && (
          <>
            <ResultDisplay
              type={typeof checkinResult === 'string' ? 'error' : 'info'}
              title="Check-in Result:"
              data={checkinResult}
            />
            {typeof checkinResult !== 'string' && checkinResult?.data?.token && (
              <div className="flex justify-end -mt-4">
                <button
                  onClick={handleCopyToken}
                  className="bg-gray-200 text-gray-800 px-3 py-1 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={copyButtonText === 'Copied!'}
                >
                  {copyButtonText}
                </button>
              </div>
            )}
          </>
        )}

        {checkoutResult && <ResultDisplay
          type={typeof checkoutResult === 'string' || (checkoutResult && (checkoutResult as any).error) ? 'error' : 'info'}
          title="Check-out Result:"
          data={checkoutResult}
        />}
        {verifyResult && <ResultDisplay
          type={typeof verifyResult === 'string' || (verifyResult && (verifyResult as any).error) ? 'error' : 'info'}
          title="Verify Result:"
          data={verifyResult}
        />}
      </Card>
    </PageLayout>
  );
}