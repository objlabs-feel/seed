import { useState, useEffect, useRef } from 'react';
import type { ApiResponse } from '@/types/api';

interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: any;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>({
  url,
  method = 'GET',
  headers = {},
  body,
  enabled = true,
  onSuccess,
  onError,
}: UseApiOptions<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = async () => {
    if (!enabled) return;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json() as ApiResponse<T>;

      if (!result.success) {
        throw new Error(result.error?.message || 'API 요청 실패');
      }

      if (!result.data) {
        throw new Error('API 응답에 데이터가 없습니다.');
      }

      if (isMountedRef.current) {
        setData(result.data);
        onSuccess?.(result.data);
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current) {
        const errorMessage = e.message || '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, method, JSON.stringify(headers), JSON.stringify(body), enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
} 