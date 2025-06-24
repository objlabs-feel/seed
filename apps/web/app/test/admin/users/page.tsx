'use client';

import { useState } from 'react';

export default function AdminUsersTestPage() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchUsers = async () => {
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const res = await fetch('/admin/api/v1/users');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      setResponse(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Users API Test</h1>
      <div className="p-6 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">GET /admin/api/v1/users</h2>
        <button
          onClick={handleFetchUsers}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Fetch Users'}
        </button>

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-green-700">Success:</h3>
            <pre className="p-4 bg-slate-100 text-slate-800 text-sm whitespace-pre-wrap break-words rounded-md">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-red-700">Error:</h3>
            <pre className="p-4 bg-red-50 text-red-700 text-sm whitespace-pre-wrap break-words rounded-md">
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 