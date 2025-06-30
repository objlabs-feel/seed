'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { SaleItemDetail } from '../components/SaleItemDetail';
import { ItemDetail } from '../components/ItemDetail';
import { SellerDetail } from '../components/SellerDetail';
import { ActionButtons } from '../components/ActionButtons';
import { BidHistory } from '../components/BidHistory';
import { useApi } from '@/hooks/useApi';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, TextField, Paper, Typography } from '@mui/material';
import { InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

export default function SaleItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('saleItem');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isBuyerInfoModalOpen, setIsBuyerInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 회사 정보
  const [companyName, setCompanyName] = useState('');
  const [businessNo, setBusinessNo] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [zipCode, setZipCode] = useState('');

  // 대표자 정보
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');

  // 계좌 정보
  const [bankHolder, setBankHolder] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankCode, setBankCode] = useState('');

  // 방문 스케줄 정보
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState(new Date().toTimeString().slice(0, 5));

  // 입금확인 후 방문스케쥴 전달 모달
  const [isDepositConfirmModalOpen, setIsDepositConfirmModalOpen] = useState(false);

  // localStorage에서 토큰 가져오기
  useEffect(() => {
    const storedToken = localStorage.getItem('client_token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  // 현재 로그인한 사용자 정보 조회
  const { data: currentUser, loading: userLoading } = useApi<any>({
    url: '/api/v1/auth/verify',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    enabled: !!authToken,
  });

  const { data: saleItem, loading, error } = useApi<any>({
    url: `/api/v1/saleitems/${params.id}`,
    headers: { Authorization: `Bearer ${authToken}` },
    enabled: !!authToken,
  });

  if (loading || userLoading) {
    return <div className="text-white">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-white">에러: {error}</div>;
  }

  if (!saleItem) {
    return <div className="text-white">판매 아이템을 찾을 수 없습니다.</div>;
  }
  
  // console.log('currentUser:', JSON.stringify(currentUser, null, 2));
  // console.log('owner_id:', saleItem.owner_id);

  const isOwner = currentUser?.user?.id === saleItem.owner_id.toString();
  const isHighestBidder = saleItem.item?.auction_item_history?.[0]?.user_id?.toString() === currentUser?.user?.id?.toString();
  // console.log('isOwner:', isOwner, {
  //   userId: currentUser?.user?.id,
  //   ownerId: saleItem.owner_id.toString(),
  //   types: {
  //     userId: typeof currentUser?.user?.id,
  //     ownerId: typeof saleItem.owner_id.toString()
  //   }
  // });

  console.log('saleItem:', JSON.stringify(saleItem, null, 2));

  // 입금확인 후 방문스케쥴 전달 모달
  const handleDepositConfirmSubmit = async () => {
    if (!visitDate || !visitTime) {
      alert('방문 날짜와 시간을 모두 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/auctions/${saleItem.item?.id}/bid/buyer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          visitDate: visitDate,
          visitTime: visitTime,
        }),
      });

      if (!response.ok) {
        throw new Error('방문 스케줄 전달 중 오류가 발생했습니다.');
      }

      router.refresh();
      setIsDepositConfirmModalOpen(false);
      setVisitDate('');
      setVisitTime('');
    } catch (error) {
      console.error('방문 스케줄 전달 중 오류가 발생했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyerInfoSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/auctions/${saleItem.item?.id}/bid/buyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
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
        throw new Error('낙찰자 정보 입력 중 오류가 발생했습니다.');
      }

      router.refresh();
      setIsBuyerInfoModalOpen(false);
    } catch (error) {
      console.error('낙찰자 정보 입력 중 오류가 발생했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/test/client/saleitems')}
            className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded"
          >
            ← 목록으로 돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-white">판매 아이템 상세</h1>
        </div>
        <div className="flex gap-2">
          {isHighestBidder && saleItem.item?.status === 2 && saleItem.item?.buyer_steps ===1 && (
            <Button
              onClick={() => setIsBuyerInfoModalOpen(true)}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
            >
              낙찰자 정보 작성
            </Button>
          )}
          {saleItem.item?.status === 2 && saleItem.item?.buyer_steps === 3 && (
            <Button
              onClick={() => setIsDepositConfirmModalOpen(true)}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
            >
              입금확인 후 방문스케쥴 전달
            </Button>
          )}
          <ActionButtons saleItem={saleItem} isOwner={isOwner} />
        </div>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('saleItem')}
            className={`${
              activeTab === 'saleItem'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            상품 정보
          </button>
          <button
            onClick={() => setActiveTab('item')}
            className={`${
              activeTab === 'item'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            상품 상세 정보
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`${
              activeTab === 'seller'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            판매자 정보
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`${
              activeTab === 'bids'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            입찰 내역
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'saleItem' && (
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">상품 정보</h2>
            <div className="mt-4">
              <SaleItemDetail saleItem={saleItem} />
            </div>
          </div>
        )}

        {activeTab === 'item' && (
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">상품 상세 정보</h2>
            <div className="mt-4">
              <ItemDetail item={saleItem.item} />
            </div>
          </div>
        )}

        {activeTab === 'seller' && (
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">판매자 정보</h2>
            <div className="mt-4">
              <SellerDetail saleItem={saleItem} />
            </div>
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">입찰 내역</h2>
            <div className="mt-4">
              <BidHistory saleItem={saleItem} currentUser={currentUser?.data?.user} />
            </div>
          </div>
        )}
      </div>

      {/* 낙찰자 정보 작성 모달 status = 1 */}
      {saleItem.item?.status === 2 && saleItem.item?.buyer_steps === 1 && (
      <Dialog open={isBuyerInfoModalOpen} onClose={() => setIsBuyerInfoModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>낙찰자 정보 작성</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="회사명"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="회사명을 입력하세요"
                />
                <TextField
                  fullWidth
                  label="사업자등록번호"
                  value={businessNo}
                  onChange={(e) => setBusinessNo(e.target.value)}
                  placeholder="사업자등록번호를 입력하세요"
                />
              </Stack>

              <TextField
                fullWidth
                label="주소"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="주소를 입력하세요"
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="상세주소"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="상세주소를 입력하세요"
                />
                <TextField
                  fullWidth
                  label="우편번호"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="우편번호를 입력하세요"
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="대표자명"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="대표자명을 입력하세요"
                />
                <TextField
                  fullWidth
                  label="이메일"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              </Stack>

              <TextField
                fullWidth
                label="연락처"
                value={ownerMobile}
                onChange={(e) => setOwnerMobile(e.target.value)}
                placeholder="연락처를 입력하세요"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBuyerInfoModalOpen(false)}>취소</Button>
          <Button 
            onClick={handleBuyerInfoSubmit} 
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
      )}
      {/* 입금확인 후 방문스케쥴 전달 모달 status = 2 && buyer_steps = 3 */}
      {saleItem.item?.status === 2 && saleItem.item?.buyer_steps === 3 && (
      <Dialog open={isDepositConfirmModalOpen} onClose={() => setIsDepositConfirmModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>입금확인 후 방문스케쥴 전달</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <Typography variant="h6">입금확인 후 방문스케쥴 전달</Typography>
              <Typography>
                입금확인 후 방문스케쥴 전달 모달입니다.
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="방문 날짜"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0], // 오늘 이후 날짜만 선택 가능
                  }}
                />
                <TextField
                  fullWidth
                  label="방문 시간"
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 900, // 15분 단위
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDepositConfirmModalOpen(false)}>취소</Button>
          <Button 
            onClick={handleDepositConfirmSubmit} 
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '확인'}
          </Button>
        </DialogActions>
      </Dialog>
      )}
    </div>
  );
} 