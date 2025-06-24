'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BidModal from '../components/BidModal';
import { AuctionItem, AuctionItemHistory } from '@repo/shared/models';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [auctionItem, setAuctionItem] = useState<any>(null);
  const [highestBidder, setHighestBidder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  useEffect(() => {
    fetchAuctionItem();
  }, [params.id]);

  const fetchAuctionItem = async () => {
    try {
      const response = await fetch(`/admin/api/v1/auction-items/${params.id}`);
      const data = await response.json();
      setAuctionItem(data);

      if (data.auction_item_history.length > 0) {
        const highestBid = data.auction_item_history.reduce((prev: any, current: any) => {
          return prev.value > current.value ? prev : current;
        });
        setHighestBidder(highestBid);
      }
    } catch (err) {
      setError('경매 상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (userId: number, value: number) => {
    try {
      const response = await fetch(`/admin/api/v1/auction-items/${params.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          value
        }),
      });

      if (response.ok) {
        alert('입찰이 완료되었습니다.');
      } else {
        throw new Error('입찰 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('입찰 처리 중 오류가 발생했습니다.');
    }
  };

  const handleComplete = async () => {
    if (!confirm('해당 경매를 낙찰 처리하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/v1/auction-items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 1, // 낙찰완료 상태
        }),
      });

      if (response.ok) {
        alert('낙찰 처리되었습니다.');
        fetchAuctionItem(); // 상태 갱신
      }
    } catch (err) {
      alert('낙찰 처리 중 오류가 발생했습니다.');
    }
  };

  const handleConfirm = async () => {
    if (!confirm('입금확인 사항을 확정하시겠습니까?')) return;

    try {
      const response = await fetch(`/admin/api/v1/auction-items/${params.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('경매가 확정되었습니다.');
        fetchAuctionItem(); // 상태 갱신
      }
    } catch (err) {
      alert('경매 확정 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = async () => {
    if (!confirm('경매를 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/v1/auction-items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 2, // 취소 상태
        }),
      });

      if (response.ok) {
        alert('경매가 취소되었습니다.');
        fetchAuctionItem(); // 상태 갱신
      }
    } catch (err) {
      alert('경매 취소 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!auctionItem) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">경매 상품 상세정보</h2>
        <div className="space-x-2">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            입금확인
          </button>
          <button
            onClick={() => setIsBidModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            입찰하기
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            낙찰처리
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            경매취소
          </button>
          <button
            onClick={() => router.push(`/admin/products/${params.id}/edit`)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            수정
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">경매 정보</h3>
          <div className="space-y-2">
            <p>상품 코드: {auctionItem.auction_code}</p>
            <p>상태: {getStatusText(auctionItem.status)}</p>
            <p>시작 시간: {new Date(auctionItem.start_timestamp).toLocaleString()}</p>
            <p>만료 횟수: {auctionItem.expired_count}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">의료기기 정보</h3>
          <div className="space-y-2">
            <p>설명: {auctionItem.medical_device?.description}</p>
            <p>제조일: {auctionItem.medical_device?.manufacture_date ? new Date(auctionItem.medical_device.manufacture_date).toLocaleDateString() : ''}</p>
            {auctionItem.medical_device?.images.length > 0 && (
              <div>
                <p className="mb-2">이미지:</p>
                <div className="grid grid-cols-3 gap-2">
                  {auctionItem.medical_device.images.map((image: any, index: any) => (
                    <img
                      key={index}
                      src={image}
                      alt={`의료기기 이미지 ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-4">최고 입찰자</h2>
        {highestBidder && (
          <p>이용자ID : {highestBidder.user_id} 입찰가 : {highestBidder.value}</p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-4">입찰 내역</h3>
        <div className="space-y-2">
          {auctionItem.auction_item_history.map((history: any) => (
            <p key={history.id}>이용자ID : {history.user_id} 입찰가 : {history.value}</p>
          ))}
        </div>
      </div>

      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handleBid}
      />
    </div>
  );
}

function getStatusText(status: number) {
  switch (status) {
  case 0: return '진행중';
  case 1: return '낙찰완료';
  case 2: return '취소';
  default: return '알수없음';
  }
}