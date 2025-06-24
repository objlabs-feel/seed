'use client';

import { useState } from 'react';
import { Input } from '@repo/ui/input';

// 페이지네이션과 데이터를 포함하는 일반적인 응답 형태
interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export default function AdminProductTestPage() {
  const [getResult, setGetResult] = useState<string>('');
  const [postResult, setPostResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // GET 요청 폼 상태
  const [searchParams, setSearchParams] = useState({
    page: '1',
    limit: '10',
    keyword: '',
    status: '',
    owner_id: '',
    device_id: '',
    min_price: '',
    max_price: '',
  });

  // POST 요청 폼 상태 (CreateProductRequestDto 참고)
  const [newProduct, setNewProduct] = useState({
    owner_id: '',
    device_id: '',
    media: '[]',
    info: '{}',
    available_quantity: '1',
    origin_price: '0',
    sale_price: '0',
    // ... 기타 필요한 필드들
  });

  const handleGetProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGetResult('');
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([, value]) => value !== '')
    );
    const query = new URLSearchParams(filteredParams).toString();
    try {
      const response = await fetch(`/admin/api/v1/product?${query}`);
      const data: ApiResponse<any> = await response.json();
      setGetResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setGetResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePostProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPostResult('');
    try {
      // 숫자 필드는 숫자로 변환
      const body = {
        ...newProduct,
        owner_id: BigInt(newProduct.owner_id),
        device_id: BigInt(newProduct.device_id),
        available_quantity: parseInt(newProduct.available_quantity, 10),
        origin_price: parseInt(newProduct.origin_price, 10),
        sale_price: parseInt(newProduct.sale_price, 10),
        media: JSON.parse(newProduct.media), // JSON 문자열을 객체로
        info: JSON.parse(newProduct.info), // JSON 문자열을 객체로
      };
      const response = await fetch('/admin/api/v1/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setPostResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setPostResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const renderFormInputs = (state: object, setState: Function, isPost: boolean) => {
    return Object.keys(state).map((key) => (
        <div key={key}>
            <label htmlFor={`${isPost ? 'post' : 'get'}-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
            </label>
            <Input
                id={`${isPost ? 'post' : 'get'}-${key}`}
                type="text"
                placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                value={state[key as keyof typeof state]}
                onChange={(e) => setState({ ...state, [key]: e.target.value })}
                className="mt-0"
                required={isPost && ['owner_id', 'device_id'].includes(key)}
            />
        </div>
    ));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Product API Test Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GET Products Section */}
        <div className="p-6 border rounded-lg shadow-md border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">GET /admin/api/v1/product</h2>
          <form onSubmit={handleGetProducts} className="space-y-4">
            {renderFormInputs(searchParams, setSearchParams, false)}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : '조회'}
            </button>
          </form>
          <pre className="mt-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded text-sm overflow-auto max-h-96">{getResult}</pre>
        </div>

        {/* POST Product Section */}
        <div className="p-6 border rounded-lg shadow-md border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">POST /admin/api/v1/product</h2>
          <form onSubmit={handlePostProduct} className="space-y-4">
            {renderFormInputs(newProduct, setNewProduct, true)}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : '생성'}
            </button>
          </form>
          <pre className="mt-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded text-sm overflow-auto max-h-96">{postResult}</pre>
        </div>
      </div>
    </div>
  );
} 