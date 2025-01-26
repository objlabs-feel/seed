'use client';

import React, { useState, useEffect } from 'react';
import UserSelectModal from './UserSelectModal';

declare global {
  interface Window {
    daum: any
  }
}

interface CompanyFormData {
  name: string
  business_no: string
  business_tel: string
  business_mobile: string
  company_type: number
  zipcode: string
  address: string
  adddress_detail: string
}

interface CompanyRegisterFormProps {
  initialData?: Company  // 수정 모드일 때 초기값
  onSubmit: (company: any) => void
  onCancel: () => void
}

export default function CompanyRegisterForm({ initialData, onSubmit, onCancel }: CompanyRegisterFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: initialData?.name || '',
    business_no: initialData?.business_no || '',
    business_tel: initialData?.business_tel || '',
    business_mobile: initialData?.business_mobile || '',
    company_type: initialData?.company_type || 0,
    zipcode: initialData?.zipcode || '',
    address: initialData?.address || '',
    adddress_detail: initialData?.adddress_detail || ''
  });
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Daum 우편번호 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleOpenPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        // 우편번호와 주소 정보를 state에 업데이트
        setFormData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.address,
          // 참고항목이 있을 경우 괄호와 함께 추가
          adddress_detail: data.buildingName ?
            `(${data.buildingName})` : ''
        }));
      }
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCompany = await response.json();
        onSubmit(newCompany);
      } else {
        throw new Error('업체 등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('업체 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 선택 함수
  const handleSelectUser = (selectedUser: User) => {
    console.log(selectedUser);
    setOwnerId(selectedUser.id);
    setIsModalOpen(false); // 모달 닫기
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-start gap-2 pt-4">
        <label className="block text-sm font-medium mb-1">소유자ID:</label>
        <input type="text" value={ownerId || ''} readOnly />
        <button className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          type="button" onClick={() => setIsModalOpen(true)}>소유자 검색</button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">업체명</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">사업자번호</label>
        <input
          type="text"
          value={formData.business_no}
          onChange={(e) => setFormData({ ...formData, business_no: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">업체 구분</label>
        <select
          value={formData.company_type}
          onChange={(e) => setFormData({ ...formData, company_type: parseInt(e.target.value) })}
          className="w-full p-2 border rounded"
          required
        >
          <option value={0}>병원</option>
          <option value={1}>일반사업자</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">전화번호</label>
        <input
          type="tel"
          value={formData.business_tel}
          onChange={(e) => setFormData({ ...formData, business_tel: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">휴대전화</label>
        <input
          type="tel"
          value={formData.business_mobile}
          onChange={(e) => setFormData({ ...formData, business_mobile: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">주소</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.zipcode}
              placeholder="우편번호"
              className="w-32 p-2 border rounded"
              readOnly
            />
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={handleOpenPostcode}
            >
              주소 검색
            </button>
          </div>
          <input
            type="text"
            value={formData.address}
            placeholder="기본주소"
            className="w-full p-2 border rounded"
            readOnly
          />
          <input
            type="text"
            value={formData.adddress_detail}
            placeholder="상세주소"
            onChange={(e) => setFormData({ ...formData, adddress_detail: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* BidModal 사용 */}
      <UserSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectUser}
      />

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </form>
  );
}