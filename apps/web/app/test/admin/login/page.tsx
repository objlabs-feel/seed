'use client';

import { useState } from 'react';
import { Input } from '@repo/ui/input';
import { Button } from '@repo/ui/button';
import { useAuth } from '@/app/test/_contexts/AuthContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');
  const { setToken } = useAuth();

  const handleLogin = async () => {
    setMessage('');
    setToken(null);
    try {
      const response = await fetch('/admin/api/v1/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data?.token) {
          setToken(data.data.token);
          setMessage('Login successful! Token stored.');
        } else {
          setMessage('Login successful, but no token received.');
        }
      } else {
        setMessage(`Login failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Admin Login Test</h1>
      <div className="space-y-2 max-w-sm">
        <Input
          type="text"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <Input
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button onClick={handleLogin}>Login</Button>
      </div>
      {message && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
    </div>
  );
}