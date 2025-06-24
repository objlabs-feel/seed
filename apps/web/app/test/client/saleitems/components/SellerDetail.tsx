'use client';

import { useEffect } from 'react';
import { SaleItem, User } from '@repo/shared/models';
import { useApi } from '@/hooks/useApi';

interface SellerDetailProps {
  saleItem: SaleItem & { user: User };
}

export function SellerDetail({ saleItem }: SellerDetailProps) {
  const { user } = saleItem;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">판매자 정보</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">이름</p>
          <p>{user.profile?.name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">이메일</p>
          <p>{user.profile?.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">전화번호</p>
          <p>{user.profile?.mobile || 'N/A'}</p>
        </div>
        {user.profile?.company && (
          <>
            <div>
              <p className="text-sm text-gray-500">회사명</p>
              <p>{user.profile.company.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">사업자번호</p>
              <p>{user.profile.company.business_no || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">회사 전화번호</p>
              <p>{user.profile.company.business_tel || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">주소</p>
              <p>
                {user.profile.company.address || 'N/A'}
                {user.profile.company.address_detail && ` (${user.profile.company.address_detail})`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 