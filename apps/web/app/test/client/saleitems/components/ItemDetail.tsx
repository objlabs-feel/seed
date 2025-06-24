import { Product, AuctionItem } from '@repo/shared/models';

interface ItemDetailProps {
  item: Product | AuctionItem;
}

function isAuctionItem(item: Product | AuctionItem): item is AuctionItem {
  return 'auction_code' in item;
}

export function ItemDetail({ item }: ItemDetailProps) {
  if (!item) {
    return <div>아이템 정보가 없습니다.</div>;
  }

  if (isAuctionItem(item)) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">경매 코드</h3>
            <p>{item.auction_code}</p>
          </div>
          <div>
            <h3 className="font-semibold">수량</h3>
            <p>{item.quantity || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">시작 시간</h3>
            <p>{item.start_timestamp ? new Date(item.start_timestamp).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">방문 날짜</h3>
            <p>{item.visit_date ? new Date(item.visit_date).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">방문 시간</h3>
            <p>{item.visit_time || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">상태</h3>
            <p>{item.status}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">판매가</h3>
          <p>{item.sale_price?.toLocaleString()}원</p>
        </div>
        <div>
          <h3 className="font-semibold">원가</h3>
          <p>{item.origin_price?.toLocaleString()}원</p>
        </div>
        <div>
          <h3 className="font-semibold">할인 유형</h3>
          <p>{item.discount_type}</p>
        </div>
        <div>
          <h3 className="font-semibold">할인 값</h3>
          <p>{item.discount_value}</p>
        </div>
        <div>
          <h3 className="font-semibold">재고</h3>
          <p>{item.available_quantity}개</p>
        </div>
        <div>
          <h3 className="font-semibold">상태</h3>
          <p>{item.status}</p>
        </div>
      </div>
    </div>
  );
} 