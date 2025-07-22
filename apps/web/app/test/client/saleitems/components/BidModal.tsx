'use client';

import { useState } from 'react';
import { formatCurrency } from '@/app/test/client/utils/format';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  currentPrice: number;
}

const MIN_BID_AMOUNT = 1000;

export function BidModal({ isOpen, onClose, onSubmit, currentPrice }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      setError('유효한 입찰 금액을 입력해주세요.');
      return;
    }

    const amount = Number(bidAmount);
    if (amount < MIN_BID_AMOUNT) {
      setError(`최소 입찰금액은 ${formatCurrency(MIN_BID_AMOUNT)}입니다.`);
      return;
    }

    if (amount <= currentPrice) {
      setError('현재가보다 높은 금액을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(amount);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '입찰에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 총 입찰금액(사용자 입력)을 기반으로 판매금, 부가세, 수수료 계산
  const totalAmount = Number(bidAmount);
  const fee = totalAmount * 0.08;
  const vat = (totalAmount - fee) * 0.1;
  const saleAmount = totalAmount - fee - vat;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-white">입찰하기</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-300 mb-1">
              총 입찰금액
            </label>
            <input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`최소 ${formatCurrency(MIN_BID_AMOUNT)}부터 입력 가능`}
              min={MIN_BID_AMOUNT}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>원금</span>
              <span>{formatCurrency(saleAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>부가세 (10%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>수수료 (8%)</span>
              <span>{formatCurrency(fee)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-600 text-white">
              <span>총 입찰금액</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !bidAmount || Number(bidAmount) < MIN_BID_AMOUNT}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:bg-gray-500"
            >
              {isSubmitting ? '입찰 중...' : '입찰하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}