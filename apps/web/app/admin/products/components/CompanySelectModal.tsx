'use client';

import { useState } from 'react';
import CompanyRegisterForm from './CompanyRegisterForm';

interface Company {
  id: number
  name: string
  business_no: string
  business_tel: string
  license_img: string | null
  owner_id: number | null
  related_members: any[]
  institute_members: any[]
  created_at: string
  updated_at: string
  company_type: number
  business_mobile: string | null
  secret_info: {
    bankAccount: string
    bankCode: string
    ownerName: string
    businessEmail: string
    businessNo: string
    businessTel: string
    businessMobile: string
  }
  zipcode: string | null
  address: string | null
  adddress_detail: string | null
  profile?: {
    id: number
    name: string
    email: string
    mobile: string
  }
}

interface CompanySelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (company: Company) => void
}

export default function CompanySelectModal({ isOpen, onClose, onSelect }: CompanySelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/companies/search?type=${searchType}&term=${searchTerm}`);
      const data = await response.json();
      console.log(data);
      setCompanies(data.companies);
    } catch (err) {
      console.error('업체 검색 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = (newCompany: Company) => {
    setShowRegisterForm(false);
    onSelect(newCompany);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        {!showRegisterForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">업체 선택</h3>
              <button
                onClick={() => setShowRegisterForm(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                신규 등록
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="name">업체명</option>
                <option value="business_no">사업자번호</option>
                <option value="profile_name">대표자명</option>
                <option value="tel">전화번호</option>
                <option value="email">이메일</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="검색어 입력..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                검색
              </button>
            </div>

            <div className="mb-4 max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">업체명</th>
                    <th className="p-2 text-left">구분</th>
                    <th className="p-2 text-left">사업자번호</th>
                    <th className="p-2 text-left">대표자</th>
                    <th className="p-2 text-left">연락처</th>
                    <th className="p-2 text-left">주소</th>
                    <th className="p-2 text-left">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(company => (
                    <tr key={company.id} className="border-b">
                      <td className="p-2">{company.name}</td>
                      <td className="p-2">{company.company_type === 0 ? '병원' : '일반사업자'}</td>
                      <td className="p-2">{company.business_no}</td>
                      <td className="p-2">{company.profile?.name}</td>
                      <td className="p-2">
                        {company.business_mobile || company.business_tel}
                      </td>
                      <td className="p-2">
                        {company.address && `${company.zipcode} ${company.address} ${company.adddress_detail || ''}`}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => onSelect(company)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                닫기
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">신규 업체 등록</h3>
            <CompanyRegisterForm
              onSubmit={handleRegisterSuccess}
              onCancel={() => setShowRegisterForm(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}