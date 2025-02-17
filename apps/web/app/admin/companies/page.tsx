'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CompanyRegisterForm from '../products/components/CompanyRegisterForm';

interface Company {
  id: number
  name: string
  business_no: string
  business_tel: string
  business_mobile: string | null
  company_type: number
  zipcode: string | null
  address: string | null
  address_detail: string | null
  profile?: {
    name: string
    email: string
    mobile: string
  }
}

interface SearchFilters {
  name: string
  business_no: string
  company_type: number | null
  profile_name: string
}

export default function CompanyManagement() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    business_no: '',
    company_type: null,
    profile_name: ''
  });

  // 무한 스크롤을 위한 observer
  const observer = useRef<IntersectionObserver>();
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    if (node) {
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      });
      observer.current.observe(node);
    }
  }, [loading, hasMore]);

  const fetchCompanies = async (pageNum: number, isNewSearch = false) => {
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filters.name && { name: filters.name }),
        ...(filters.business_no && { business_no: filters.business_no }),
        ...(filters.company_type !== null && { company_type: filters.company_type.toString() }),
        ...(filters.profile_name && { profile_name: filters.profile_name })
      });

      const response = await fetch(`/api/v1/companies/search?${queryParams}`);
      const data = await response.json();

      if (data.companies) {
        setCompanies(prev => isNewSearch ? data.companies : [...prev, ...data.companies]);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      setError('업체 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    setCompanies([]);
    fetchCompanies(1, true);
  };

  const handleRegisterSuccess = (newCompany: Company) => {
    setShowRegisterForm(false);
    setCompanies(prev => [newCompany, ...prev]);
  };

  useEffect(() => {
    fetchCompanies(page);
  }, [page]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        {!showRegisterForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">업체 관리</h2>
              <button
                onClick={() => setShowRegisterForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                신규 업체 등록
              </button>
            </div>

            {/* 검색 필터 */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="업체명"
                className="p-2 border rounded"
                onChange={e => handleFilterChange({ ...filters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="사업자번호"
                className="p-2 border rounded"
                onChange={e => handleFilterChange({ ...filters, business_no: e.target.value })}
              />
              <input
                type="text"
                placeholder="대표자명"
                className="p-2 border rounded"
                onChange={e => handleFilterChange({ ...filters, profile_name: e.target.value })}
              />
              <select
                className="p-2 border rounded"
                onChange={e => handleFilterChange({
                  ...filters,
                  company_type: e.target.value ? parseInt(e.target.value) : null
                })}
              >
                <option value="">업체 구분</option>
                <option value="0">병원</option>
                <option value="1">일반사업자</option>
              </select>
            </div>

            {/* 업체 목록 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left font-medium text-gray-500">업체명</th>
                    <th className="p-4 text-left font-medium text-gray-500">구분</th>
                    <th className="p-4 text-left font-medium text-gray-500">사업자번호</th>
                    <th className="p-4 text-left font-medium text-gray-500">대표자</th>
                    <th className="p-4 text-left font-medium text-gray-500">연락처</th>
                    <th className="p-4 text-left font-medium text-gray-500">주소</th>
                    <th className="p-4 text-left font-medium text-gray-500">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companies.map((company, index) => (
                    <tr
                      key={company.id}
                      ref={index === companies.length - 1 ? lastItemRef : null}
                      className="hover:bg-gray-50"
                    >
                      <td className="p-4">{company.name}</td>
                      <td className="p-4">{company.company_type === 0 ? '병원' : '일반사업자'}</td>
                      <td className="p-4">{company.business_no}</td>
                      <td className="p-4">{company.profile?.name}</td>
                      <td className="p-4">{company.business_mobile || company.business_tel}</td>
                      <td className="p-4">
                        {company.address && `${company.zipcode} ${company.address} ${company.address_detail || ''}`}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => router.push(`/admin/companies/${company.id}`)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading && <div className="text-center py-4">로딩 중...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-6">신규 업체 등록</h2>
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