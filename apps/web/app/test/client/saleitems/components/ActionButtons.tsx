'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { SaleItem } from '@repo/shared/types/models';
import { useApi } from '@/hooks/useApi';
import { BidModal } from './BidModal';
import { AwardModal } from './AwardModal';
import { AuctionItemHistory } from '@repo/shared/types/models';
import type { Bid } from './AwardModal';

interface ActionButtonsProps {
  saleItem: SaleItem;
  isOwner: boolean;
}

const convertToBid = (history: AuctionItemHistory): Bid => ({
  id: history.id.toString(),
  value: history.value || 0,
  created_at: history.created_at instanceof Date
    ? history.created_at.toISOString()
    : (history.created_at ?? undefined),
});

export const ActionButtons = ({ saleItem, isOwner }: ActionButtonsProps) => {
  const router = useRouter();
  const { refetch: deleteSaleItem } = useApi({
    url: `/api/v1/saleitems/${saleItem.id}`,
    method: 'DELETE',
    enabled: false,
  });

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem('client_token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  const handleEdit = () => {
    router.push(`/test/client/saleitems/${saleItem.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/v1/saleitems/${saleItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('삭제 처리 중 오류가 발생했습니다.');
      }

      router.refresh();
    } catch (error) {
      console.error('삭제 처리 중 오류가 발생했습니다:', error);
    }
  };

  const handleBid = async (bidAmount: number) => {
    try {
      const response = await fetch(`/api/v1/auctions/${saleItem.item?.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          value: bidAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('입찰 처리 중 오류가 발생했습니다.');
      }

      router.refresh();
      setIsBidModalOpen(false);
    } catch (error) {
      console.error('입찰 처리 중 오류가 발생했습니다:', error);
    }
  };

  const handleAward = async (
    accept_id: string,
    companyName: string,
    businessNo: string,
    address: string,
    addressDetail: string,
    zipCode: string,
    ownerName: string,
    ownerEmail: string,
    ownerMobile: string,
    bankHolder: string,
    bankAccount: string,
    bankCode: string,
  ) => {
    try {
      const response = await fetch(`/api/v1/auctions/${saleItem.item?.id}/bid/seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          accept_id,
          companyName,
          businessNo,
          address,
          addressDetail,
          zipCode,
          ownerName,
          ownerEmail,
          ownerMobile,
          bankHolder,
          bankAccount,
          bankCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '낙찰 처리에 실패했습니다.');
      }

      // 낙찰 성공 후 페이지 새로고침
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : '낙찰 처리에 실패했습니다.');
    }
  };

  return (
    <div className="flex gap-2">
      {isOwner ? (
        <>
          <Button
            onClick={handleEdit}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded"
          >
            수정
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
          >
            삭제
          </Button>
          <Button
            onClick={() => setIsAwardModalOpen(true)}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
          >
            낙찰
          </Button>
        </>
      ) : (
        <Button
          onClick={() => setIsBidModalOpen(true)}
          className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded"
        >
          입찰
        </Button>
      )}

      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handleBid}
        currentPrice={saleItem.item && 'auction_item_history' in saleItem.item && saleItem.item.auction_item_history?.[0]?.value || 0}
      />

      <AwardModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        bids={saleItem.item && 'auction_item_history' in saleItem.item 
          ? (saleItem.item.auction_item_history || []).map(convertToBid)
          : []}
        auctionItemId={saleItem.item?.id?.toString() || ''}
        onAward={handleAward}
      />
    </div>
  );
}; 