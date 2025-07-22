import { SaleItem } from '@repo/shared/models';

interface SaleItemDetailProps {
  saleItem: SaleItem;
}

export function SaleItemDetail({ saleItem }: SaleItemDetailProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">판매 유형</h3>
          <p>{saleItem.salesType?.name || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">상태</h3>
          <p>{saleItem.status}</p>
        </div>
        <div>
          <h3 className="font-semibold">생성일</h3>
          <p>{saleItem.created_at ? new Date(saleItem.created_at).toLocaleString() : 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">수정일</h3>
          <p>{saleItem.updated_at ? new Date(saleItem.updated_at).toLocaleString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}