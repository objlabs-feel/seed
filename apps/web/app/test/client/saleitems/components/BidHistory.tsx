import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Bid {
  id: string;
  value: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface AuctionItem {
  id: string;
  owner_id: string;
  status: string;
  auction_item_history: Bid[];
}

interface BidHistoryProps {
  saleItem: AuctionItem;
  currentUser: User;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ saleItem, currentUser }) => {
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [highestBid, setHighestBid] = useState<Bid | null>(null);
  const [myBids, setMyBids] = useState<Bid[]>([]);

  const { data: auctionData, loading } = useApi<any>({
    url: `/api/v1/saleitems/${saleItem.id}`,
    headers: { Authorization: `Bearer ${localStorage.getItem('client_token')}` },
  });

  useEffect(() => {
    if (auctionData) {
      setBidHistory(auctionData.item.auction_item_history || []);
      setHighestBid(auctionData.auction_item_history?.[0] || null);
      setMyBids(auctionData.auction_item_history?.filter((bid: Bid) => bid.user_id === currentUser?.id) || []);
    }
  }, [auctionData, currentUser]);

  if (loading) {
    return <div className="text-white">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 최고가 입찰 정보 */}
      {highestBid && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">최고가 입찰 정보</h3>
          <div className="text-gray-300">
            <p>입찰 금액: {highestBid.value.toLocaleString()}원</p>
            <p>입찰 시간: {new Date(highestBid.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* 내 입찰 내역 */}
      {myBids.length > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">내 입찰 내역</h3>
          <div className="space-y-2">
            {myBids.map((bid) => (
              <div key={bid.id} className="text-gray-300">
                <p>입찰 금액: {bid.value.toLocaleString()}원</p>
                <p>입찰 시간: {new Date(bid.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 입찰 내역 */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">전체 입찰 내역</h3>
        <div className="space-y-2">
          {bidHistory.map((bid) => (
            <div key={bid.id} className="text-gray-300">
              <p>입찰 금액: {bid.value.toLocaleString()}원</p>
              <p>입찰 시간: {new Date(bid.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 