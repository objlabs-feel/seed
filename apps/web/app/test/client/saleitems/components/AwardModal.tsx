import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, TextField, Paper, Typography } from '@mui/material';
import { InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

export interface Bid {
  id: string;
  value: number;
  user?: {
    name: string;
    email: string;
  };
  created_at: string | null | undefined;
}

interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bids: Bid[];
  auctionItemId: string;
  onAward: (
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
  ) => void;
}

export const AwardModal = ({
  isOpen,
  onClose,
  bids,
  auctionItemId,
  onAward,
}: AwardModalProps) => {
  const [selectedBidId, setSelectedBidId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    // 최고 입찰가를 기본값으로 설정
    if (bids.length > 0) {
      const highestBid = bids.reduce((prev, current) =>
        (prev.value > current.value) ? prev : current
      );
      setSelectedBidId(highestBid.id);
    }
  }, [bids]);

  const handleSubmit = () => {
    if (!selectedBidId) return;
    onAward(
      selectedBidId,
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
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>낙찰 처리</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Stack spacing={2}>
            {bids.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    최고 입찰 정보
                  </Typography>
                  <Typography>입찰자: {bids[0]?.user?.name ?? '알 수 없음'}</Typography>
                  <Typography>이메일: {bids[0]?.user?.email ?? '이메일 정보 없음'}</Typography>
                  <Typography>입찰가: {bids[0]?.value?.toLocaleString() ?? '0'}원</Typography>
                </Stack>
              </Paper>
            )}

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

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="예금주"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="예금주를 입력하세요"
              />
              <FormControl fullWidth>
                <InputLabel>은행</InputLabel>
                <Select
                  value={bankCode}
                  label="은행"
                  onChange={(e: SelectChangeEvent) => setBankCode(e.target.value)}
                >
                  <MenuItem value="001">국민은행</MenuItem>
                  <MenuItem value="002">우리은행</MenuItem>
                  <MenuItem value="003">신한은행</MenuItem>
                  <MenuItem value="004">하나은행</MenuItem>
                  <MenuItem value="005">농협은행</MenuItem>
                  <MenuItem value="006">기업은행</MenuItem>
                  <MenuItem value="007">SC은행</MenuItem>
                  <MenuItem value="008">씨티은행</MenuItem>
                  <MenuItem value="009">대구은행</MenuItem>
                  <MenuItem value="010">부산은행</MenuItem>
                  <MenuItem value="011">광주은행</MenuItem>
                  <MenuItem value="012">제주은행</MenuItem>
                  <MenuItem value="013">전북은행</MenuItem>
                  <MenuItem value="014">경남은행</MenuItem>
                  <MenuItem value="015">새마을금고</MenuItem>
                  <MenuItem value="016">신협</MenuItem>
                  <MenuItem value="017">우체국</MenuItem>
                  <MenuItem value="018">수협</MenuItem>
                  <MenuItem value="019">산업은행</MenuItem>
                  <MenuItem value="020">한국은행</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              fullWidth
              label="계좌번호"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="계좌번호를 입력하세요"
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded"
          disabled={isLoading || !selectedBidId}
        >
          {isLoading ? '처리중...' : '낙찰 처리'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};