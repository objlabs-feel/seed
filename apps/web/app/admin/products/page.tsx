'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MedicalDevice {
  id: number
  description: string
  // 필요한 다른 필드들 추가
}

interface AuctionItemHistory {
  id: number
  value: number
  created_at: string
}

interface AuctionItem {
  id: number
  auction_code: string
  status: number
  start_timestamp: string
  expired_count: number
  medical_device: MedicalDevice
  auction_item_history: AuctionItemHistory[]
}

interface AuctionResponse {
  items: AuctionItem[]
  total: number
  page: number
  totalPages: number
}

interface SearchFilters {
  auction_code: string;
  status: number | null;
  user_id: string;
  profile_id: string;
  device_id: string;
}

export default function ProductList() {
  const router = useRouter();
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    auction_code: '',
    status: null,
    user_id: '',
    profile_id: '',
    device_id: ''
  });

  // 무한 스크롤을 위한 observer
  const observer = useRef<IntersectionObserver>();
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    if (node) {
      observer.current = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      });
      observer.current.observe(node);
    }
  }, [loading, hasMore]);

  const fetchAuctionItems = async (pageNum: number, isNewSearch = false) => {
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filters.auction_code && { auction_code: filters.auction_code }),
        ...(filters.status !== null && { status: filters.status.toString() }),
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.profile_id && { profile_id: filters.profile_id }),
        ...(filters.device_id && { device_id: filters.device_id })
      });

      const response = await fetch(`/api/v1/auction-items?${queryParams}`);
      const data = await response.json();

      if (data.items) {
        setAuctionItems(prev => isNewSearch ? data.items : [...prev, ...data.items]);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      setError('경매 상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경시 호출
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    setAuctionItems([]);
    fetchAuctionItems(1, true);
  };

  useEffect(() => {
    fetchAuctionItems(page);
  }, [page]);

  const getStatusText = (status: number) => {
    switch (status) {
    case 0: return '진행중';
    case 1: return '낙찰완료';
    case 2: return '취소';
    default: return '알수없음';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">경매 상품 목록</h2>
          <button
            onClick={() => router.push('/admin/products/register')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            경매상품 등록
          </button>
        </div>

        {/* 검색 필터 */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="상품 코드"
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, auction_code: e.target.value })}
          />
          <select
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, status: parseInt(e.target.value) })}
          >
            <option value="">상태 선택</option>
            <option value="0">진행중</option>
            <option value="1">낙찰완료</option>
            <option value="2">취소</option>
          </select>
        </div>

        {/* 상품 목록 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium text-gray-500">상품코드</th>
                <th className="p-4 text-left font-medium text-gray-500">상품설명</th>
                <th className="p-4 text-left font-medium text-gray-500">시작시간</th>
                <th className="p-4 text-left font-medium text-gray-500">최고 입찰가</th>
                <th className="p-4 text-left font-medium text-gray-500">상태</th>
                <th className="p-4 text-left font-medium text-gray-500">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auctionItems.map((item, index) => (
                <tr
                  key={item.id}
                  ref={index === auctionItems.length - 1 ? lastItemRef : null}
                  className="hover:bg-gray-50"
                >
                  <td className="p-4">{item.auction_code}</td>
                  <td className="p-4">{item.medical_device.description}</td>
                  <td className="p-4">
                    {new Date(item.start_timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {item.auction_item_history[0]?.value
                      ? `${item.auction_item_history[0].value.toLocaleString()}원`
                      : '입찰 없음'
                    }
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.status === 0 ? 'bg-blue-100 text-blue-800' :
                        item.status === 1 ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => router.push(`/admin/products/${item.id}`)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="text-center py-4">로딩 중...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
      </div>
    </div>
  );
}