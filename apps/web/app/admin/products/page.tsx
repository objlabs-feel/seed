'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuctionItem } from '@repo/shared/models';

// interface IAuctionResponse {
//   items: IAuctionItem[]
//   total: number
//   page: number
//   totalPages: number
// }

interface SearchFilters {
  auction_code: string;
  status: number | null;
  user_id: string;
  profile_id: string;
  device_id: string;
  seller_steps: number | null;
  buyer_steps: number | null;
}

export default function ProductList() {
  const router = useRouter();
  const [auctionItems, setAuctionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    auction_code: '',
    status: null,
    user_id: '',
    profile_id: '',
    device_id: '',
    seller_steps: null,
    buyer_steps: null
  });

  // 무한 스크롤을 위한 observer
  const observer = useRef<IntersectionObserver>();
  const isFetching = useRef(false);
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    console.log('lastItemRef 호출됨:', { node, loading, hasMore });
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    if (node) {
      observer.current = new IntersectionObserver(entries => {
        console.log('IntersectionObserver 콜백:', { entries, hasMore });
        if (entries[0]?.isIntersecting && hasMore) {
          console.log('다음 페이지 로드 트리거');
          setPage(prev => prev + 1);
        }
      });
      observer.current.observe(node);
    }
  }, [loading, hasMore]);

  const fetchAuctionItems = async (pageNum: number, isNewSearch = false) => {
    if (isFetching.current) {
      console.log('이미 fetch 중이므로 중단');
      return;
    }
    isFetching.current = true;
    try {
      console.log('fetchAuctionItems 호출됨:', { pageNum, isNewSearch, filters });
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filters.auction_code && { auction_code: filters.auction_code }),
        ...(filters.status !== null && { status: filters.status.toString() }),
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.profile_id && { profile_id: filters.profile_id }),
        ...(filters.device_id && { device_id: filters.device_id }),
        ...(filters.seller_steps !== null && { seller_steps: filters.seller_steps.toString() }),
        ...(filters.buyer_steps !== null && { buyer_steps: filters.buyer_steps.toString() })
      });

      const response = await fetch(`/admin/api/v1/auction-items?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('admin_token=')[1]}`,
        },
      });
      const data = await response.json();

      console.log(data);

      if (data.items) {
        setAuctionItems(prev => isNewSearch ? data.items : [...prev, ...data.items]);
        // hasMore 계산: 현재 페이지가 전체 페이지보다 작으면 더 로드 가능
        const hasMoreData = data.page < data.totalPages;
        setHasMore(hasMoreData);
        console.log('페이징 정보:', { 
          currentPage: data.page, 
          totalPages: data.totalPages, 
          hasMore: hasMoreData,
          total: data.total,
          itemsCount: data.items.length
        });
      }
    } catch (err) {
      setError('경매 상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // 필터 변경시 호출
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    setAuctionItems([]);
  };

  useEffect(() => {
    console.log('useEffect 실행됨:', { page, filters });
    fetchAuctionItems(page);
  }, [page, filters]);

  const getStatusText = (status: number) => {
    switch (status) {
    case 0: return '비활성';
    case 1: return '입찰중';
    case 2: return '낙찰완료';
    case 3: return '거래완료';
    case 4: return '취소';
    default: return '알수없음';
    }
  };

  const getSellerStepsText = (steps: number) => {
    switch (steps) {
    case 0: return '낙찰전';
    case 1: return '낙찰진행';
    case 2: return '낙찰완료';
    case 3: return '양도진행';
    case 4: return '양도완료';  
    default: return '알수없음';
    }
  };

  const getBuyerStepsText = (steps: number) => {
    switch (steps) {
    case 0: return '낙찰전';
    case 1: return '낙찰자정보입력요청';
    case 2: return '낙찰자정보입력완료';
    case 3: return '입금확인';
    case 4: return '양수진행';
    case 5: return '양수완료';  
    default: return '알수없음';
    }
  };

  const getHighestBid = (item: AuctionItem) => {
    if (item.auction_item_history && item.auction_item_history.length > 0) {
      const highestBid = item.auction_item_history.reduce((max, bid) => {
        return bid.value && bid.value > max ? bid.value : max;
      }, 0);
      return highestBid ? highestBid.toLocaleString() : '입찰 없음';
    }
    return '입찰 없음';
  };

  return (
    <div className="bg-white rounded-lg shadow font-sans">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">경매 상품 목록</h2>
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
            onChange={e => handleFilterChange({ ...filters, seller_steps: parseInt(e.target.value) })}
          >
            <option value="">판매자상태</option>
            <option value="0">낙찰전</option>
            <option value="1">낙찰진행</option>
            <option value="2">낙찰완료</option>
            <option value="3">양도진행</option>
            <option value="4">양도완료</option>
          </select>
          <select
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, buyer_steps: parseInt(e.target.value) })}
          >
            <option value="">구매자상태</option>
            <option value="0">낙찰전</option>
            <option value="1">낙찰자정보입력요청</option>
            <option value="2">낙찰자정보입력완료</option>
            <option value="3">입금확인</option>
            <option value="4">양수진행</option>
            <option value="5">양수완료</option>
          </select>
          <select
            className="p-2 border rounded"
            onChange={e => handleFilterChange({ ...filters, status: parseInt(e.target.value) })}
          >
            <option value="">상태 선택</option>
            <option value="1">진행중</option>
            <option value="2">낙찰</option>
            <option value="3">완료</option>
            <option value="4">취소</option>
          </select>
        </div>

        {/* 상품 목록 */}
        {/* 데스크톱 테이블 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-medium text-gray-900">상품코드</th>
                <th className="p-4 text-left font-medium text-gray-900">상품설명</th>
                <th className="p-4 text-left font-medium text-gray-900">최고 입찰가</th>
                <th className="p-4 text-left font-medium text-gray-900">진행단계</th>
                <th className="p-4 text-left font-medium text-gray-900">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auctionItems.map((item, index) => (
                <tr
                  key={item.id}
                  ref={index === auctionItems.length - 1 ? lastItemRef : null}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/products/${item.id}`)}
                >
                  <td className="p-4 text-gray-900">{item.auction_code}</td>
                  <td className="p-4 text-gray-900">{item.device.description}</td>
                  <td className="p-4 text-gray-900">
                    {item.auction_item_history && item.auction_item_history.length > 0
                      ? `${getHighestBid(item)}원`
                      : '입찰 없음'
                    }
                  </td>
                  <td className="p-4 text-gray-900">
                    판매자 : {getSellerStepsText(item.seller_steps)} / 구매자 : {getBuyerStepsText(item.buyer_steps)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 목록 */}
        <div className="md:hidden space-y-4">
          {auctionItems.map((item, index) => (
            <div
              key={item.id}
              ref={index === auctionItems.length - 1 ? lastItemRef : null}
              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/admin/products/${item.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{item.auction_code}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.device.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 0 ? 'bg-blue-100 text-blue-800' :
                    item.status === 1 ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(item.status)}
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">최고 입찰가:</span>
                  <p className="text-gray-900 font-medium">
                    {item.auction_item_history && item.auction_item_history.length > 0
                      ? `${getHighestBid(item)}원`
                      : '입찰 없음'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">진행단계:</span>
                  <div className="space-y-1 mt-1">
                    <p className="text-gray-900 font-medium">
                      판매자: {getSellerStepsText(item.seller_steps)}
                    </p>
                    <p className="text-gray-900 font-medium">
                      구매자: {getBuyerStepsText(item.buyer_steps)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {loading && <div className="text-center py-4 text-gray-900">로딩 중...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
        <div className="text-center py-2 text-sm text-gray-600">
          총 {auctionItems.length}개 항목, 페이지: {page}, 더 로드 가능: {hasMore ? '예' : '아니오'}
        </div>
      </div>
    </div>
  );
}